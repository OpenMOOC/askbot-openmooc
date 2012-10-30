from django.contrib.auth.models import User


def generate_unique_username(candidate, max_length):
    candidate_count = User.objects.filter(username__istartswith=candidate).count()
    if candidate_count > 0:
        end = u'(%s)' % (candidate_count + 1)
        if max_length and len(candidate) + len(end) > max_length:
            candidate = candidate[:max_length-len(end)]
        candidate = u'%s%s' % (candidate, end)
    return candidate
