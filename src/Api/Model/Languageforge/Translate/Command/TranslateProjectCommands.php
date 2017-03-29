<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Translate\TranslateConfig;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Languageforge\Translate\TranslateUserPreferences;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Palaso\Utilities\CodeGuard;

class TranslateProjectCommands
{
    /**
     * Create or update project
     * @param string $projectId
     * @param string $userId
     * @param array<projectModel> $data
     * @param ClientInterface|null $client
     * @throws UserUnauthorizedException
     * @throws \Exception
     * @return string projectId
     */
    public static function updateProject($projectId, $userId, $data, ClientInterface $client = null)
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (!$project->hasRight($userId, Domain::USERS + Operation::EDIT)) {
            throw new UserUnauthorizedException("Insufficient privileges to update project in method 'updateProject'");
        }

        $hasMachineTranslationProjectChanged = self::hasMachineTranslationProjectChanged($project, $data);
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
            self::decodeConfig($project->config, $data['config']);
        }

        if (self::isNewProject($data)) {
            self::createMachineTranslationProject($project, $client);
        } elseif ($hasMachineTranslationProjectChanged) {
            self::removeMachineTranslationProject($project, $client);
            self::createMachineTranslationProject($project, $client);
        }

        return $project->write();
    }

    /**
     * @param string $projectId
     * @param array $configData
     * @param ClientInterface|null $client
     * @throws \Exception
     * @return string $projectId
     */
    public static function updateConfig($projectId, $configData, ClientInterface $client = null)
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        $hasMachineTranslationProjectChanged = self::hasMachineTranslationProjectChanged($project, ['config' => $configData]);
        self::decodeConfig($project->config, $configData);

        if ($hasMachineTranslationProjectChanged) {
            self::removeMachineTranslationProject($project, $client);
            self::createMachineTranslationProject($project, $client);
        }

        return $project->write();
    }

    /**
     * @param string $projectId
     * @param string $userId
     * @param array<TranslateUserPreferences> $data
     * @return string $projectId
     */
    public static function updateUserPreferences($projectId, $userId, $data)
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        if (array_key_exists('selectedDocumentSetId', $data) ||
            array_key_exists('isDocumentOrientationTargetRight', $data)
        ) {
            if (!array_key_exists($userId, $project->config->usersPreferences)) {
                $project->config->usersPreferences[$userId] = new TranslateUserPreferences();
            }

            if (array_key_exists('selectedDocumentSetId', $data)) {
                $project->config->usersPreferences[$userId]->selectedDocumentSetId = $data['selectedDocumentSetId'];
            }

            if (array_key_exists('isDocumentOrientationTargetRight', $data)) {
                $project->config->usersPreferences[$userId]->isDocumentOrientationTargetRight = $data['isDocumentOrientationTargetRight'];
            }
        }

        return $project->write();
    }

    /**
     * @param TranslateProjectModel $project
     * @param ClientInterface $client
     */
    public static function createMachineTranslationProject($project, ClientInterface $client = null)
    {
        CodeGuard::checkEmptyAndThrow($project->config->source->inputSystem->tag, 'project->config->source->inputSystem->tag');
        CodeGuard::checkEmptyAndThrow($project->config->target->inputSystem->tag, 'project->config->target->inputSystem->tag');
        if (is_null($client)) {
            $client = new Client();
        }

        $url = 'http://localhost/machine/translation/engines/';
        $url .= $project->config->source->inputSystem->tag . '/';
        $url .= $project->config->target->inputSystem->tag . '/projects';
        $postData = [
            'json' => [
                'id' => $project->databaseName(),
                'isShared' => !!$project->config->isTranslationDataShared
            ]
        ];
        $client->post($url, $postData);
    }

    /**
     * @param TranslateProjectModel $project
     * @param ClientInterface $client
     */
    public static function removeMachineTranslationProject($project, ClientInterface $client = null)
    {
        CodeGuard::checkEmptyAndThrow($project->config->source->inputSystem->tag, 'project->config->source->inputSystem->tag');
        CodeGuard::checkEmptyAndThrow($project->config->target->inputSystem->tag, 'project->config->target->inputSystem->tag');
        if (is_null($client)) {
            $client = new Client();
        }

        $url = 'http://localhost/machine/translation/engines/';
        $url .= $project->config->source->inputSystem->tag . '/';
        $url .= $project->config->target->inputSystem->tag . '/projects/';
        $url .= $project->databaseName();
        try {
            $client->delete($url);
        } catch (RequestException $e) {
            // if the project didn't exist don't throw exception
            if ($e->getCode() != 404) {
                throw $e;
            }
        }
    }

    /**
     * @param array $data
     * @return bool
     */
    private static function isNewProject($data)
    {
        return !array_key_exists('id', $data) || $data['id'] == '';
    }

    /**
     * @param TranslateProjectModel $project
     * @param array $data
     * @return bool
     */
    private static function hasMachineTranslationProjectChanged($project, $data)
    {
        if (array_key_exists('config', $data)) {
            if (array_key_exists('source', $data['config']) &&
                array_key_exists('inputSystem', $data['config']['source']) &&
                array_key_exists('tag', $data['config']['source']['inputSystem']) &&
                $data['config']['source']['inputSystem']['tag'] != $project->config->source->inputSystem->tag
            ) {
                return true;
            }
            if (array_key_exists('target', $data['config']) &&
                array_key_exists('inputSystem', $data['config']['target']) &&
                array_key_exists('tag', $data['config']['target']['inputSystem']) &&
                $data['config']['target']['inputSystem']['tag'] != $project->config->target->inputSystem->tag
            ) {
                return true;
            }
            if (array_key_exists('isTranslationDataShared', $data['config']) &&
                !!$data['config']['isTranslationDataShared'] != !!$project->config->isTranslationDataShared
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param TranslateConfig $config
     * @param array $configData
     * @return TranslateConfig
     */
    private static function decodeConfig($config, $configData): TranslateConfig
    {
        if (array_key_exists('userPreferences', $configData)) unset($configData['userPreferences']);

        JsonDecoder::decode($config, $configData);
        return $config;
    }
}
