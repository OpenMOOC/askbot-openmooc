# Copyright 2012 Rooter Analysis S.L.
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

import csv
from optparse import make_option

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):

    help = ("create a zip bundle with csv file with students extra stats info")

    option_list = BaseCommand.option_list + (
        make_option('-f', '--filename',
                    action='store',
                    dest='filename',
                    default="",
                    help="Filename to save the csv file"),

    )

    def error(self, message):
        self.stderr.write("%s\n" % message.encode("utf-8", "ignore"))

    def message(self, message):
        self.stdout.write("%s\n" % message.encode("utf-8", "ignore"))

    def handle(self, *args, **options):

        if not options["filename"]:
            raise CommandError("-f filename.csv is required")

        if options["filename"].endswith(".csv"):
            self.filename = options["filename"]
        else:
            self.filename = "%s.csv" % options["filename"]

        self.message("Creating file %s" % self.filename)

        headers = [
            "email",
            "fullname",
            "first_forum_access",
            "comments",
            "votes_done_in_posts",
            "votes_done_in_answers",
            "posts",
            "posts_with_vote",
            "total_votes_received_in_posts",
            "answers",
            "answers_with_vote",
            "total_votes_received_in_answers",
            "karma",
            "gold badges",
            "silver badges",
            "bronze badges"
        ]

        with open(self.filename, 'wb') as stats_file:
            stats_csv = csv.writer(stats_file)
            stats_csv.writerow(headers)

            for user in User.objects.all():
                row = []
                row.append(getattr(user, 'email'))
                fullnamevalue = user.get_full_name()
                row.append(fullnamevalue.encode("utf-8", "ignore"))
                row.append(user.date_joined.isoformat())
                comments = user.posts.get_comments().all()
                row.append(comments.count())

                questions_voted_by_user = 0
                answers_voted_by_user = 0
                for vote in user.votes.all():
                    post = vote.voted_post
                    if post.is_question():
                        questions_voted_by_user += 1
                    elif post.is_answer():
                        answers_voted_by_user += 1

                row.append(questions_voted_by_user)
                row.append(answers_voted_by_user)

                questions = user.posts.get_questions().all()
                row.append(questions.count())
                voted_questions = questions.filter(score__gt=0)
                row.append(voted_questions.count())

                total_votes_received_in_questions = 0
                for voted_question in voted_questions:
                    total_votes_received_in_questions += voted_question.score

                answers = user.posts.get_answers().all()
                row.append(answers.count())
                voted_answers = answers.filter(score__gt=0)
                row.append(voted_answers.count())

                total_votes_received_in_answers = 0
                for voted_answer in voted_answers:
                    total_votes_received_in_answers += voted_answer.score

                row.append(int(user.reputation))
                row.append(user.gold)
                row.append(user.silver)
                row.append(user.bronze)
                stats_csv.writerow(row)

        self.message("Created %s file" % self.filename)
