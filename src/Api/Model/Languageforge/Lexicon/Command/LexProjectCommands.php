<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\Mapper\JsonDecoder;
use Api\Model\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;

class LexProjectCommands
{
    public static function updateConfig($projectId, $config)
    {
        $project = new LexiconProjectModel($projectId);
        $configModel = new LexConfiguration();
        JsonDecoder::decode($configModel, $config);
        $project->config = $configModel;
        $decoder = new JsonDecoder();
        $decoder->decodeMapOf('', $project->inputSystems, $config['inputSystems']);
        $project->write();
    }

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
        $project = new LexiconProjectModel($projectId);
        if (!$project->hasRight($userId, Domain::USERS + Operation::EDIT)) {
            throw new UserUnauthorizedException("Insufficient privileges to update project in method 'updateProject'");
        }
        $oldDBName = $project->databaseName();

        $object['id'] = $projectId;
        JsonDecoder::decode($project, $object);
        $newDBName = $project->databaseName();
        if (($oldDBName != '') && ($oldDBName != $newDBName)) {
            if (MongoStore::hasDB($newDBName)) {
                throw new \Exception("Cannot rename '$oldDBName' to ' $newDBName' . New project name $newDBName already exists.  Not renaming.");
            }
            MongoStore::renameDB($oldDBName, $newDBName);
        }
        $projectId = $project->write();

        return $projectId;
    }

    /**
     * @param string $id
     * @param string $authUserId - the admin user's id performing the update (for auth purposes)
     */
    public static function readProject($id)
    {
        $project = new LexiconProjectModel($id);

        return JsonEncoder::encode($project);
    }
}
