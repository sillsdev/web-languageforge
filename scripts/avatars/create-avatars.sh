#!/bin/bash

# Data files accompanying this script:
# all-animals.txt - all available animals, used and unused
# all-dark-colors.txt - all available dark colors, used and unused
# all-light-colors.txt - all available light colors, used and unused
# animals.txt - only the animals we're using for avatars
# dark-colors.txt - dark colors (where the silhouette should be white)
# light-colors.txt - light colors (where the silhouette should be black)
# sizes.txt - all avatar sizes we want (currently only 48x48)

# Color names in the *-colors.txt files are from ImageMagick's "known colors"
# list, which can be seen by running "convert -list colors". We may want to
# use different names in the user interface, so that (for exmaple) users are
# selecting "dark brown" instead of "chocolate4".

# Check for required command-line programs
NOTFOUND=0
CONVERT=$(which convert)
OPTIPNG=$(which optipng)

if [ ! -x "$CONVERT" ]; then
    echo ImageMagick not found
    echo Run "sudo apt-get install imagemagick" to install it
    NOTFOUND=$((NOTFOUND + 1))
fi

if [ ! -x "$OPTIPNG" ]; then
    echo optipng not found
    echo Run "sudo apt-get install optipng" to install it
    NOTFOUND=$((NOTFOUND + 1))
fi

if [ "$NOTFOUND" -gt 0 ]; then
    echo Some required software was not found.
    echo Install it and then rerun this script.
    exit 2
fi

OUTDIR=../../src/Site/views/shared/image/avatar
mkdir -p $OUTDIR
for animal in `cat animals.txt`
do
    inputfile="orig-${animal}.png"
    echo $animal
    for size in `cat sizes.txt`
    do
        for color in `cat light-colors.txt`
        do
            convert $inputfile -background $color -flatten -resize $size -gravity center -extent $size -depth 8 -colors 64 ${OUTDIR}/${color}-${animal}-${size}.png
            optipng -q -o7 ${OUTDIR}/${color}-${animal}-${size}.png
        done
        for color in `cat dark-colors.txt`
        do
            convert $inputfile -negate -background $color -flatten -resize $size -gravity center -extent $size -depth 8 -colors 64 ${OUTDIR}/${color}-${animal}-${size}.png
            optipng -q -o7 ${OUTDIR}/${color}-${animal}-${size}.png
        done
    done
done

# And also do 8x8 squares for the "pick a color" menu

size="8x8"
for color in `cat light-colors.txt dark-colors.txt`
do
    convert -size $size canvas:${color} ${OUTDIR}/${color}-square-${size}.png
done
