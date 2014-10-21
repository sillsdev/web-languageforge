#!/bin/bash

fullpath="$1"
extension="${2-UNSPECIFIED}"
basename="$(basename "$1")"

# Calculate extension if not specified
if [ "$extension" = "UNSPECIFIED" ]
then
    extension="${basename##*.}"
    basename="${basename%.*}"
    second_extension="${basename##*.}"
fi

# Some tarballs have .tgz or .tbz2 extensions, rather than .tar.gz or .tar.bz2
case "$extension" in
    t[gbx]z|tbz2)
        second_extension="tar"
        ;;
esac

if [ "$second_extension" = "tar" ]
then
    size=$(tar tvf "$fullpath" | awk '{ SUM += $3; } END { print SUM; }')
else
    case "$extension" in
        gz)
            size=$(gunzip -l "$fullpath" | tail -n 1 | awk '{ print $2; }')
            ;;
        xz)
            size=$(xz -lv "$fullpath" | grep "Uncompressed size:" | awk '{ print $5; }' | tr -d '(,')
            ;;
        bz|bz2)
            # Unfortunately, bzip2 doesn't provide a list option; we have to actually decompress the file and count bytes
            size=$(bzip2 -dc "$fullpath" | wc -c)
            ;;
        zip)
            size=$(unzip -l "$fullpath" | tail -n 1 | awk '{ print $1; }')
            ;;
        7z)
            size=$(7z l "$fullpath" | tail -n 1 | awk '{ print $1; }')
            ;;
        rar)
            size=$(unrar l "$fullpath" | tail -n 2 | head -n 1 | awk '{ print $1; }')
            ;;
        *)
            # Unrecognized extensions are an error
            exit 1
    esac
fi

echo $size
exit 0
