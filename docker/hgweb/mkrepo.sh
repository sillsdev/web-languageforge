#! /usr/bin/env sh
set -e

# Create a sample repo for testing whether hgweb is running
SAMPLE_REPO=${SAMPLE_REPO:-foo}
mkdir -p $SAMPLE_REPO
cd $SAMPLE_REPO
hg init
echo Hello World > hello.txt
hg add hello.txt
hg commit -m 'Created a hello world file'
