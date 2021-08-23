#!/bin/sh

# Run lfmergeqm every 24 hours to clean up any failed syncs that aren't in the queue
# This script MUST be run as a background process ("script.sh &")!

# First time we're run is before Apache starts up, so wait 120 seconds to allow Apache time to start up
# (because LfMerge depends on Apache and PHP being up so that the RunClass.php code will work right)
sleep 120

# Now enter an infinite loop that will run eery 24*60*60 = 86400 seconds
while :
do
  which lfmergeqm && su www-data -s /bin/bash -c lfmergeqm
  sleep 86400
done
