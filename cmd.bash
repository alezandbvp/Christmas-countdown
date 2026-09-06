#!/bin/bash

PREFIX="Music Now, Trap Music Now, Dance Music Now - "
SUFFIX=" (SPOTISAVER)"

find "./songs" -type f -print0 |
while IFS= read -r -d '' file; do
    dir=$(dirname "$file")
    name=$(basename "$file")
    newname="${name#"$PREFIX"}"

    for ext in .mp3 .wav .m4a .flac .ogg; do
        if [[ "$newname" == *"$SUFFIX$ext" ]]; then
            newname="${newname%"$SUFFIX$ext"}$ext"
            break
        fi
    done

    if [[ "$name" != "$newname" ]]; then
        echo "$name -> $newname"
        mv -- "$file" "$dir/$newname"
    fi
done