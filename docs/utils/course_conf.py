#!/bin/bash

from optparse import OptionParser

COURSES_PATH="/home/mooc/courses"


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="filename",
                      help="FILE to write conf")
    parser.add_option("-t", "--template",
                      action="store", dest="template",
                      help="template file")
    
    parser.add_option("-p", "--port",
                      action="store", dest="port",
                      help="application port")
    
    parser.add_option("-n", "--name",
                      action="store", dest="name",
                      help="application name")
    
    (options, args) = parser.parse_args()
    
    if not(options.filename and options.template and options.port and options.name):
       parser.print_usage()

    with open(options.template, "r") as templatefile:
        template = templatefile.read()


    # .format does not run because templates are very complex
    render = template.replace("{name}", options.name)
    render = render.replace("{port}", options.port)
    render = render.replace("{coursespath}", COURSES_PATH)

    with open(options.filename, "w") as conffile:
        conffile.write(render)
