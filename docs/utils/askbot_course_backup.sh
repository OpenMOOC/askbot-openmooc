#!/bin/bash

script_help () {
   echo "With VIRTUAL_ENV loaded"
   echo "Usage: $0 [course_name]"
   echo "If course_name is not given, present directory is taken as course dir"
   exit 1
}



if [ "$1" == "--help" ] ; then
    script_help
fi

if test -z "$VIRTUAL_ENV"; then
   echo "VIRTUAL_ENV is not loaded, please load it"
   exit 1
fi

COURSES_PATH=${COURSES_PATH:-'/home/mooc/courses/'}

if test -z "$1"; then
    COURSE=$(basename $PWD)
else
    COURSE=$1
    cd $COURSES_PATH/$COURSE
fi

SUFFIX="$(/bin/date +%Y-%m-%d-%H-%M-%S)"

backup_name=${COURSE}_${SUFFIX}


if ! test -e manage.py; then
    script_help
fi

python manage.py dump_forum --dump-name=${backup_name}

echo "To restore backup you can execute in course directory"
echo
echo "python manage.py load_forum ${backup_name}.json"
