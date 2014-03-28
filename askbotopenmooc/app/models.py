# -*- coding: utf-8 -*-
# Copyright 2012-2013 UNED
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from django.contrib.auth.models import User

from djangosaml2.signals import pre_user_save

from askbotopenmooc.app.utils import generate_unique_username


def change_username(user, candidate):
    if User.objects.filter(username=candidate).count() > 0:
        candidate = generate_unique_username(candidate, 75)
    user.username = candidate


def askbot_pre_user_save(sender, **kwargs):
    user = sender
    candidate = u"%s %s" % (user.first_name.strip(), user.last_name.strip())
    candidate = candidate.strip()
    candidate = candidate[:75]

    # if user is a new user
    if user.username is None:
        change_username(user, candidate)
        return True
    else:
        user_old = User.objects.get(id=user.id)
        # If user has changed his first_name or last_name
        if ((user_old.first_name != user.first_name) or
            (user_old.last_name != user.last_name)):

            change_username(user, candidate)
            return True


pre_user_save.connect(askbot_pre_user_save)
