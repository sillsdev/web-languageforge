<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;

class TranslateProjectCommands
{
    /**
     * Create or update project
     * @param string $projectId
     * @param string $userId
     * @param array<projectModel> $data
     * @throws UserUnauthorizedException
     * @throws \Exception
     * @return string projectId
     */
    public static function updateProject($projectId, $userId, $data)
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (!$project->hasRight($userId, Domain::USERS + Operation::EDIT)) {
            throw new UserUnauthorizedException("Insufficient privileges to update project in method 'updateProject'");
        }
        $oldDBName = $project->databaseName();

        $project->projectName = $data['projectName'];
        $project->interfaceLanguageCode = $data['interfaceLanguageCode'];
        $project->featured = $data['featured'];
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
