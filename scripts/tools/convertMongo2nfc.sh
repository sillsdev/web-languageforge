#!/bin/bash

for db in `mongo --eval "print('_ ' + db.getMongo().getDBNames())"|grep "^_"|awk '{print $2}'|tr ', ' ' '`
do
    out_dir="mongoexport/$db"
    mkdir -p $out_dir

    echo "Processing $db"
    for c in `mongo $db --eval "print('_ ' + db.getCollectionNames())"|grep "^_"|awk '{print $2}'|tr ', ' ' '`
    do
        filename="$out_dir/exp_${db}_${c}.json"
        mongoexport --quiet -d $db -c $c -o $filename
        python3 convertFile2Nfc.py $filename
        mongoimport --quiet --db $db --collection $c --file $filename --upsert
    done
done