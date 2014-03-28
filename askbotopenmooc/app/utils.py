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


def generate_unique_username(candidate, max_length):
    candidate_count = User.objects.filter(username__istartswith=candidate).count()
    if candidate_count > 0:
        end = u'(%s)' % (candidate_count + 1)
        if max_length and len(candidate) + len(end) > max_length:
            candidate = candidate[:max_length-len(end)]
        candidate = u'%s%s' % (candidate, end)
    return candidate
