#!/bin/sh

echo
echo Before migration, the count of projects with a usersSeeEachOthersResponses setting was:
echo
mongo scriptureforge --eval 'db.projects.find({appName: "sfchecks", usersSeeEachOthersResponses: {$ne: null}}, {projectName: 1, projectCode: 1, usersSeeEachOthersResponses: 1}).count()'

echo
echo About to run migration:
echo
mongo scriptureforge --eval 'db.projects.update({appName: "sfchecks", usersSeeEachOthersResponses: {$eq: null}}, {$set: {usersSeeEachOthersResponses: true}}, {multi: true})'

echo
echo After migration, the count of projects with a usersSeeEachOthersResponses setting has become:
echo
mongo scriptureforge --eval 'db.projects.find({appName: "sfchecks", usersSeeEachOthersResponses: {$ne: null}}, {projectName: 1, projectCode: 1, usersSeeEachOthersResponses: 1}).count()'
