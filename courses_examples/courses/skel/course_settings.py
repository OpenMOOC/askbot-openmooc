from os import path

COURSE_NAME = path.basename(path.dirname(__file__))
COURSE_DIR = path.dirname(__file__)
COURSE_URL = 'http://courses.example.com/%s/' % (COURSE_NAME)
COURSE_TITLE = COURSE_NAME.capitalize()
DATABASE_NAME = COURSE_NAME
