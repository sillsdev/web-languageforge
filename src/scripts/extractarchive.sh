#!/bin/bash

fullpath="$1"
destdir="$2"
basename="$(basename "$1")"
extension="${basename##*.}"
basename_noext="${basename%.*}"
second_extension="${basename_noext##*.}"

# Some tarballs have .tgz or .tbz2 extensions, rather than .tar.gz or .tar.bz2
case "$extension" in
    t[gbx]z|tbz2)
        second_extension="tar"
        ;;
esac

mkdir -p "$destdir"

if [ "$second_extension" = "tar" ]
then
    tar xvf "$fullpath" -C "$destdir"
else
    case "$extension" in
        gz)
            (cd "$destdir" && gzip -cd "$fullpath" > "$basename_noext")
            ;;
        xz)
            (cd "$destdir" && xz -cd "$fullpath" > "$basename_noext")
            ;;
        bz|bz2)
            (cd "$destdir" && bzip2 -cd "$fullpath" > "$basename_noext")
            ;;
        zip)
            unzip "$fullpath" -d "$destdir"
            ;;
        7z)
            # 7-zip has its own idiosyncratic command-line interface, which
            # doesn't follow standard UNIX conventions. To set output directory,
            # you have to use -o"$destdir". Using -o "$destdir" is an error.
            7z x "$fullpath" -o"$destdir"
            ;;
        rar)
            unrar x "$fullpath" "$destdir"
            ;;
        *)
            # Unrecognized extensions are an error
            exit 1
    esac
fi

echo $size
exit 0
