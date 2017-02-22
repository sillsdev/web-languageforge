<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Translate\TranslateConfig;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
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

        if (array_key_exists('projectName', $data)) {
            $oldDBName = $project->databaseName();
            $project->projectName = $data['projectName'];
            $newDBName = $project->databaseName();
            if (($oldDBName != '') && ($oldDBName != $newDBName)) {
                if (MongoStore::hasDB($newDBName)) {
                    throw new \Exception("Cannot rename '$oldDBName' to '$newDBName'. New project name $newDBName already exists. Not renaming.");
                }
                MongoStore::renameDB($oldDBName, $newDBName);
            }
        }
        if (array_key_exists('interfaceLanguageCode', $data)) {
            $project->interfaceLanguageCode = $data['interfaceLanguageCode'];
        }
        if (array_key_exists('featured', $data)) {
            $project->featured = $data['featured'];
        }
        if (array_key_exists('config', $data)) {
            $configModel = new TranslateConfig();
            JsonDecoder::decode($configModel, $data['config']);
            $project->config = $configModel;
        }
        $projectId = $project->write();

        return $projectId;
    }

    /**
     * @param string $projectId
     * @param array $config
     * @throws \Exception
     * @return string $projectId
     */
    public static function updateConfig($projectId, $config)
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        $configModel = new TranslateConfig();
        JsonDecoder::decode($configModel, $config);
        $project->config = $configModel;
        return $project->write();
    }
}
