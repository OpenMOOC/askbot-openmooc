#!/bin/bash
#
# Askbot Openmooc Script (Update entries metadata)
#

PYTHON_VIRTUAL_ENV='/home/mooc/venv'

PATH_TO_ASKBOT_OPENMOOC='/home/mooc/askbot-openmooc'

cd $PATH_TO_ASKBOT_OPENMOOC

mkdir -p /tmp/askbot-openmooc/
python manage.py update_entries_metadata &> /tmp/askbot-openmooc/update_entries_metadata.log

