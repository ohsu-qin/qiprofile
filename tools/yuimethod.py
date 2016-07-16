#!/usr/bin/env python
"""
Adds the @method tag to method comment blocks.
"""

import sys
import os
import re
import argparse

COMMENT_START_REGEX = re.compile('^(\s*)(/\*|###)\*\s*$')

COMMENT_END_REGEX = re.compile('^\s*(\*/|###)\s*$')

COMMENT_TAG_REGEX = re.compile('^\s*\* @(\w+).*$')

METHOD_REGEX = re.compile('^\s*(\w+)(\(.*\)|: ).*$')


class FormatError(Exception):
    """Error reformatting the method comments."""


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


# Adds the @method tag if necessary.
#
# @param ip the input stream
# @oaram os the output stream
def _filter(ip, op):
    comment = []
    in_block_comment = False
    has_method_tag = False
    indent = ''
    for line_nl in ip:
        line = line_nl.rstrip()
        if in_block_comment:
            comment.append(line)
            if COMMENT_END_REGEX.match(line):
                in_block_comment = False
            elif not has_method_tag:
                tag_match = COMMENT_TAG_REGEX.match(line)
                if tag_match and tag_match.group(1) == 'method':
                    has_method_tag = True
        else:
            if comment:
                method_match = METHOD_REGEX.match(line)
                method = method_match.group(1) if method_match else None
                for comment_line in comment:
                    if method and not has_method_tag and COMMENT_TAG_REGEX.match(comment_line):
                        method_tag = "%s * @method %s" % (indent, method)
                        print >>op, method_tag
                        has_method_tag = True
                    print >>op, comment_line
                has_method_tag = False
                del comment[:]
            comment_match = COMMENT_START_REGEX.match(line)
            if comment_match:
                in_block_comment = True
                indent = comment_match.group(1)
                comment.append(line)
            else:
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
