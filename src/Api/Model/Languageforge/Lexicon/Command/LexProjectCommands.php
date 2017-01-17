<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexRoleViewConfig;
use Api\Model\Languageforge\Lexicon\Config\LexUserViewConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewFieldConfig;
use Api\Model\Languageforge\Lexicon\Config\LexViewMultiTextFieldConfig;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;

class LexProjectCommands
{
    /**
     * @param string $projectId
     * @param array $config
     * @throws \Exception
     * @return bool|string $projectId
     */
    public static function updateConfig($projectId, $config)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if ($project->hasSendReceive() && SendReceiveCommands::isInProgress($projectId)) return false;

        $configModel = new LexConfiguration();
        JsonDecoder::decode($configModel, $config);
        $project->config = $configModel;
        $decoder = new JsonDecoder();
        $decoder->decodeMapOf('', $project->inputSystems, $config['inputSystems']);
        return $project->write();
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
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
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
     * @param string $fieldName
     * @return bool
     */
    public static function isCustomField($fieldName) {
        return (strpos($fieldName, 'customField_') === 0);
    }

    /**
     * Update Role Views and User Views for each custom field
     * Designed to be externally called (e.g. from LfMerge)
     *
     * @param string $projectCode
     * @param array<string> $customFieldSpecs
     * @return bool|string returns the project id on success, false otherwise
     */
    public static function updateCustomFieldViews($projectCode, $customFieldSpecs)
    {
        $project = new LexProjectModel();
        if (!$project->readByProperty('projectCode', $projectCode)) return false;
        self::removeDeletedCustomFieldViews($customFieldSpecs, $project->config);
        foreach ($customFieldSpecs as $customFieldSpec) {
            self::createNewCustomFieldViews($customFieldSpec['fieldName'], $customFieldSpec['fieldType'], $project->config);
        }

        return $project->write();
    }

    /**
     * Create any new custom field config Role Views and User Views
     *
     * @param string $customFieldName
     * @param string $customFieldType
     * @param LexConfiguration $config
     */
    public static function createNewCustomFieldViews($customFieldName, $customFieldType, &$config)
    {
        foreach ($config->roleViews as $role => $roleView) {
            if (!array_key_exists($customFieldName, $roleView->fields)) {
                if ($customFieldType == 'MultiUnicode' || $customFieldType == 'MultiString') {
                    $roleView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                } else {
                    $roleView->fields[$customFieldName] = new LexViewFieldConfig();
                }
                if ($role == LexRoles::MANAGER) {
                    $roleView->fields[$customFieldName]->show = true;
                }
            }
        }

        foreach ($config->userViews as $userId => $userView) {
            if (!array_key_exists($customFieldName, $userView->fields)) {
                if ($customFieldType == 'MultiUnicode' || $customFieldType == 'MultiString') {
                    $userView->fields[$customFieldName] = new LexViewMultiTextFieldConfig();
                } else {
                    $userView->fields[$customFieldName] = new LexViewFieldConfig();
                }
            }
        }
    }

    /**
     * Remove deleted custom field config Role Views and User Views
     *
     * @param array<string> $customFieldSpecs
     * @param LexConfiguration $config
     */
    public static function removeDeletedCustomFieldViews($customFieldSpecs, &$config)
    {
        foreach ($config->roleViews as $role => $roleView) {
            self::removeDeletedCustomFieldView($customFieldSpecs, $roleView);
        }

        foreach ($config->userViews as $userId => $userView) {
            self::removeDeletedCustomFieldView($customFieldSpecs, $userView);
        }
    }

    /**
     * Remove any view custom field that doesn't have a fieldName in customFieldSpecs
     *
     * @param array<string> $customFieldSpecs
     * @param LexRoleViewConfig|LexUserViewConfig $view
     */
    private static function removeDeletedCustomFieldView($customFieldSpecs, &$view)
    {
        $customFieldNames = array();
        foreach ($customFieldSpecs as $customFieldSpec) {
            $customFieldNames[] = $customFieldSpec['fieldName'];
        }

        $customFieldNamesToRemove = array();
        foreach ($view->fields as $fieldName => $field) {
            if (self::isCustomField($fieldName) && array_search($fieldName, $customFieldNames) === false) {
                $customFieldNamesToRemove[] = $fieldName;
            }
        }

        foreach ($customFieldNamesToRemove as $customFieldName) {
            if (array_key_exists($customFieldName, $view->fields)) {
                unset($view->fields[$customFieldName]);
            }
        }
    }

        /**
        * @param string $projectId
        * @throws \Exception
        * @return A JSON object of the configuration settings
        *
        */
       public static function readConfig($projectId)
    {
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        return $project->config;
    }

}
