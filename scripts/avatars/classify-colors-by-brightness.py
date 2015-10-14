#!/usr/bin/env python

import subprocess
import glob
import tempfile
import re
import sys

# With colors whose brightness is above the threshhold, we'll use a dark
# silhouette; otherwise, a bright one.
BRIGHTNESS_THRESHHOLD=50.0

def convert(*args, **kw):
    "Shortcut function for calling ImageMagick"
    popen_args = ['convert']
    popen_args.extend(args)
    return subprocess.check_output(popen_args, **kw)

def get_hsb(colorname):
    output = convert('canvas:{}'.format(colorname), '-size', '1x1', '-flatten', '-colorspace', 'hsb', 'txt:-')
    oneline = output.splitlines()[1]
    hsb_re = re.compile(r'(hsb|hsba)\((.*)\)')
    try:
        hsb = hsb_re.search(oneline).group(2)
    except AttributeError:
        print "Failed to find hsb for", colorname
        print "Search string was:", oneline
    return hsb

def get_brightness(colorname):
    hsb = get_hsb(colorname)
    brightness_txt = hsb.split(',')[2]
    brightness = float(brightness_txt.rstrip('%'))
    return brightness

def get_colors():
    output = convert('-list', 'color')
    lines = [line for line in output.splitlines() if 'srgb' in line]
    colors = [line.split(None, 1)[0] for line in lines]
    return colors

def main():
    colors = get_colors()
    lights = open('all-light-colors.txt', 'w')
    darks = open('all-dark-colors.txt', 'w')
    for color in colors:
        brightness = get_brightness(color)
        if brightness >= BRIGHTNESS_THRESHHOLD:
            lights.write(color + '\n')
        else:
            darks.write(color + '\n')
    print len(colors), 'colors processed.'
    return 0

if __name__ == '__main__':
    result = main()
    if result:
        import sys
        sys.exit(result)
