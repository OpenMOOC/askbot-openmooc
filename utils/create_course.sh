#!/bin/bash

if test -z "$1"; then
   echo "Usage: $0 new_course_slug"
   exit 1
fi

if test -z "$VIRTUAL_ENV"; then
   echo "VIRTUAL_ENV is not loaded, please load it"
   exit 1
fi

COURSE=$1

echo "This scripts is interactive, need mysql password and django askbot admin/password"

cd $HOME
cp -a courses/skel courses/$COURSE
mkdir -p courses/$COURSE/upfiles

set -e 
echo "Mysql root password"
echo "CREATE DATABASE askbot_$COURSE ; GRANT ALL PRIVILEGES ON askbot_$COURSE.* TO 'askbot'@'localhost'; FLUSH PRIVILEGES;" | mysql -u root -p
echo "DATABASE askbot_$COURSE CREATED"
set +e

cd courses/$COURSE
python manage.py syncdb --migrate

echo "Give user/teacher moderador"
read -p Email: EMAIL

python manage.py add_askbot_user --email "$EMAIL" --user-name "$EMAIL"
python manage.py set_moderator "$EMAIL"

