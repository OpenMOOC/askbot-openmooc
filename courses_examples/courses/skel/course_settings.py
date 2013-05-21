from os import path

COURSE_NAME = path.basename(path.dirname(__file__))
COURSE_DIR = path.dirname(__file__)
COURSE_URL = 'http://courses.example.com/course/%s/' % (COURSE_NAME)
COURSE_TITLE = COURSE_NAME.capitalize()
DATABASE_NAME = COURSE_NAME
COURSE_CLOSED = False

# SAML_AUTHORIZATION_EXPECTED_VALUE = COURSE_NAME
# SAML_AUTHORIZATION_ATTRIBUTE = "schacUserStatus"
# SAML_AUTHORIZATION_URL='https://idp.difundi.com/module.php/userregistrationApi/api.php/users/%s?apikey=k7dnfya8hs54sjfak8a5lmcha8dksh6smbtai'
# COURSE_CLOSED=True
