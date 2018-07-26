#!/bin/bash
echo "Bash version ${BASH_VERSION}..."
if [ -z "${BASH_VERSION}" ]
then
    echo "Run with bash"
    exit 1
fi

for i in {1..160}
do
	php FixEntryGuids.php
done
