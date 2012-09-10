#!/bin/bash

MYSQL_USER='root'
MYSQL_PASSWORD='mysql-root'
MYSQL_BACKUP_FILENAME="askbot-openmooc_$(/bin/date +%Y-%m-%d-%H-%M-%S)"

BACKUPS_DIR="/home/mooc/backups"

mkdir -p $BACKUPS_DIR

# days
OLDEST_BACKUP='30'

if test -n "$OLDEST_BACKUP"; then
    find $BACKUPS_DIR -ctime +${OLDEST_BACKUP} -exec rm -f {} \;
fi

/usr/bin/mysqldump --user=${MYSQL_USER} \
          --password=${MYSQL_PASSWORD} \
          --all-databases \
          --disable-keys \
          --flush-logs \
          --dump-date \
          | /usr/bin/bzip2 > ${BACKUPS_DIR}/${MYSQL_BACKUP_FILENAME}.mysql.bz2
