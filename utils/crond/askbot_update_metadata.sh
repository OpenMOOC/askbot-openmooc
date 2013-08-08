#!/bin/bash
#
# Askbot Openmooc Script (Update entries metadata)
#

PYTHON_VIRTUAL_ENV='/home/mooc/askbot-openmooc-env'

PATH_TO_ASKBOT_OPENMOOC='/home/mooc/askbot-openmooc'

cd $PATH_TO_ASKBOT_OPENMOOC

su - mooc -c "mkdir -p /tmp/askbot-openmooc/"
su - mooc -c "cd $PATH_TO_ASKBOT_OPENMOOC && \
              source $PYTHON_VIRTUAL_ENV/bin/activate && \
              python manage.py update_entries_metadata \
                 &> /tmp/askbot-openmooc/update_entries_metadata.log"
