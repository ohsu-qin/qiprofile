#!/usr/bin/env python
"""
Converts CoffeeScript comments to comment blocks to facilitate
yuidoc processing.
"""

import sys
import os
import re
import argparse

COMMENT_LINE_REGEX = re.compile('^(\s*)#+(.*)$')

BLOCK_COMMENT_REGEX = re.compile('^(\s*)###(.*)$')

COMMENT_TAG_REGEX = re.compile('^\s*#+\s+@\w+.*$')

LEADING_WORD_REGEX = re.compile('^\s*(\w+)')


class FormatError(Exception):
    """Error reformatting the CoffeeScript comments."""


def main(argv=sys.argv):
    # Parse the command line arguments.
    in_files, opts = _parse_arguments()
    dest = opts.get('dest', 'out')
    if os.path.exists(dest):
        # The target location must be a directory.
        if not os.path.isdir(dest):
            raise FormatError("The download target is not a directory:"
                              " %s" % dest)
    else:
        # Make the download directory.
        os.makedirs(dest)
    # Filter each input file.
    for in_file in in_files:
        _, base_name = os.path.split(in_file)
        out_file = os.path.join(dest, base_name)
        with open(in_file) as ip:
            with open(out_file, 'w') as op:
                _filter(ip, op)
    
    return 0


# Reformats the jsdoc block quotes in the given input.
#
# @param ip the input stream
# @oaram os the output stream
def _filter(ip, op):
    comment = []
    in_block_comment = False
    indent = ''
    for line_nl in ip:
        line = line_nl.rstrip()
        is_block_comment = BLOCK_COMMENT_REGEX.match(line)
        if in_block_comment:
            print >>op, line
            if is_block_comment:
                in_block_comment = False
        elif is_block_comment:
            for comment_line in comment:
                print >>op, comment_line
            del comment[:]
            print >>op, line
            in_block_comment = True
        else:
            match = COMMENT_LINE_REGEX.match(line)
            if match:
                if not comment:
                    indent = match.group(1)
                comment.append(line)
            else:
                if comment:
                    has_tag = any(COMMENT_TAG_REGEX.match(c) for c in comment)
                    method_match = LEADING_WORD_REGEX.match(line)
                    if has_tag and method_match:
                        method = method_match.group(1)
                        print >>op, "%s###*" % indent
                        pre_tags = True
                        for comment_line in comment:
                            if pre_tags and COMMENT_TAG_REGEX.match(comment_line):
                                print >>op, "%s * @method %s" % (indent, method)
                                pre_tags = False
                            rematch = COMMENT_LINE_REGEX.match(comment_line)
                            reline = "%s *%s" % (indent, rematch.group(2))
                            print >>op, reline
                        print >>op, "%s###" % indent
                    else:
                        for comment_line in comment:
                            print >>op, comment_line
                    del comment[:]
                    indent = ''
                print >>op, line
    for comment_line in comment:
        print >>op, comment_line


def _parse_arguments():
    """Parses the command line arguments."""
    parser = argparse.ArgumentParser()
    
    # The input file path.
    parser.add_argument('input', nargs='+', metavar="PATH", help='the input files')
    
    # The output file path.
    parser.add_argument('-d', '--dest', help='the destination directory (default ./out)')
    
    args = vars(parser.parse_args())
    nonempty_args = dict((k, v) for k, v in args.iteritems() if v != None)
    
    return nonempty_args.pop('input'), nonempty_args


if __name__ == '__main__':
    sys.exit(main())
