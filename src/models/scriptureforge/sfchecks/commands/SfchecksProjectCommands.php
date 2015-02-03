<?php

namespace models\scriptureforge\sfchecks\commands;

use models\mapper\JsonDecoder;
use models\shared\rights\Operation;
use models\shared\rights\Domain;
use models\mapper\MongoStore;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use models\scriptureforge\SfchecksProjectModel;

class SfchecksProjectCommands
{
    /**
     * Create or update project
     * @param string $projectId
     * @param string $userId
     * @param array<projectModel> $object
     * @throws UserUnauthorizedException
     * @throws \Exception
     * @return string projectId
     */
    public static function updateProject($projectId, $userId, $object)
    {
        $project = new SfchecksProjectModel($projectId);
        if (!$project->hasRight($userId, Domain::USERS + Operation::EDIT)) {
            throw new UserUnauthorizedException("Insufficient privileges to update project in method 'updateProject'");
        }
        $oldDBName = $project->databaseName();

        $object['id'] = $projectId;
        JsonDecoder::decode($project, $object);
        $newDBName = $project->databaseName();
        if (($oldDBName != '') && ($oldDBName != $newDBName)) {
            if (MongoStore::hasDB($newDBName)) {
                throw new \Exception("Cannot rename '$oldDBName' to '$newDBName'. New project name $newDBName already exists. Not renaming.");
            }
            MongoStore::renameDB($oldDBName, $newDBName);
        }
        $projectId = $project->write();

        return $projectId;
    }

}
