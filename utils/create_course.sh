#!/bin/bash

if [ "$#" != "2" ] ; then
    echo "With VIRTUAL_ENV loaded"
    echo "Usage: $0 new_course_slug database_name"
    exit 1
fi

if test -z "$VIRTUAL_ENV"; then
    echo "VIRTUAL_ENV is not loaded, please load it"
    exit 1
fi

if ! [ -f "$HOME/.course_config" ]; then
    echo "~/.course_config not found"
    echo "Please create this file with this content:"
    echo 'COURSE_SKEL="Path to your course skel"'
    echo 'REMOTE_HOST="visible IP for this system to your proxy"'
    echo 'SUPERUSER_DB_PASSWORD="YourAdminMysqlPassword'
    echo 'SUPERUSER_DB_USER="YourAdminMysqlUser"'
    echo 'GUNICORN_START_PORT=10000'
    exit 1
fi

COURSE=$1
DB_NAME=$2

COURSE_SKEL=${COURSE_SKEL:-'/home/mooc/askbot-openmooc/courses_examples/courses/skel'}
REMOTE_HOST=192.168.155.155
SUPERUSER_DB_PASSWORD="YourPassword"
SUPERUSER_DB_USER="root"
GUNICORN_START_PORT=10000

source ~/.course_config


set -e


CREATE_DB="CREATE DATABASE $DB_NAME ; GRANT ALL PRIVILEGES ON $DB_NAME.* TO 'askbot'@'localhost'; FLUSH PRIVILEGES;"
if [ -n "$SUPERUSER_DB_PASSWORD" ]; then
    echo "$CREATE_DB" | mysql -u "$SUPERUSER_DB_USER" --password="$SUPERUSER_DB_PASSWORD"
else
    echo "Mysql needs $SUPERUSER_DB_USER@localhost  password to create database $DB_NAME"
    echo "This scripts is interactive, need mysql password and django askbot admin/password"
    echo "$CREATE_DB" | mysql -u "$SUPERUSER_DB_USER" -p
fi

echo "DATABASE $DB_NAME CREATED"

echo "Creating directories"

cd $HOME
cp -av $COURSE_SKEL courses/$COURSE
chmod 755 courses/$COURSE
mkdir -p courses/$COURSE/upfiles
cd courses/$COURSE

sed "s/^DATABASE_NAME.*$/DATABASE_NAME = '$DB_NAME'/g" -i course_settings.py
if [ -d fixtures ]; then
    python manage.py syncdb --migrate --noinput
    find fixtures -type f -exec python manage.py loaddata {} \;
else
    python manage.py syncdb --migrate --noinput
fi

GUNICORN_PORT=$(($GUNICORN_START_PORT + $(ls -1 ../ | wc -l)))

if [ -f *.conf ]; then
    sed "s/{port}/$GUNICORN_PORT/g" -i *.conf
    sed "s/{rhost}/$REMOTE_HOST/g" -i *.conf
    sed "s/{name}/$COURSE/g" -i *.conf
    sed "s/{coursepath}/$PWD/g" -i *.conf
fi

echo "Give user/teacher (email) moderator"
read -p Email: EMAIL

python manage.py add_askbot_user --email "$EMAIL" --user-name "$EMAIL"
python manage.py set_moderator "$EMAIL"

set +e

echo "Updating SP group metadata"
cd ~/askbot-openmooc/
python manage.py update_entries_metadata


~/bin/idp_metarefresh.sh

cd ~
supervisorctl reread
supervisor start $COURSE

set +e
nginx -t
if [ "0" == "$?" ]; then
    echo "Please, execute service nginx reload as root"
else
    echo "ERROR!!: Please, check courses/$COURSE/nginx.conf file"
fi
echo "INFO!!: Please, copy courses/$COURSE/nginx.forward.conf file"
