<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\LexiconRoles;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\Mapper\JsonDecoder;
use Api\Model\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;

class LexProjectCommands
{
    /**
     * @param string $projectId
     * @param array $config
     * @throws \Exception
     */
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
     * @return array
     */
    public static function readProject($id)
    {
        $project = new LexiconProjectModel($id);

        return JsonEncoder::encode($project);
    }

    /**
     * Create Role Views and User Views for each custom field
     * Designed to be externally called (e.g. from LfMerge)
     *
     * @param string $projectCode
     * @param array $customFields
     * @return bool|string returns the project id on success, false otherwise
     */
    public static function createCustomFieldsViews($projectCode, $customFields)
    {
        $project = new LexiconProjectModel();
        if (!$project->readByProperty('projectCode', $projectCode)) return false;
        foreach ($customFields as $customField) {
            self::createCustomFieldViews($customField['name'], $customField['specType'], $project->config);
        }

        return $project->write();
    }

    /**
     * Create custom field config Role Views and User Views
     *
     * @param string $customFieldName
     * @param string $customFieldSpecType
     * @param LexConfiguration $config
     */
    public static function createCustomFieldViews($customFieldName, $customFieldSpecType, &$config)
    {
        foreach ($config->roleViews as $role => $roleView) {
            if (!array_key_exists($customFieldName, $roleView->fields)) {
                if ($customFieldSpecType == 'ReferenceAtom') {
                    $roleView->fields[$customFieldName] = new LexViewFieldConfig();
                } else {
                    $roleView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                }
                if ($role == LexiconRoles::MANAGER) {
                    $roleView->fields[$customFieldName]->show = true;
                }
            }
        }

        foreach ($config->userViews as $userId => $userView) {
            if (!array_key_exists($customFieldName, $userView->fields)) {
                if ($customFieldSpecType == 'ReferenceAtom') {
                    $userView->fields[$customFieldName] = new LexViewFieldConfig();
                } else {
                    $userView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                }
            }
        }
    }

}
