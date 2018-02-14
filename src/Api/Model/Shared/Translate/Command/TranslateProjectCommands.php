<?php

namespace Api\Model\Shared\Translate\Command;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Translate\TranslateConfig;
use Api\Model\Shared\Translate\TranslateProjectModel;
use Api\Model\Shared\Translate\TranslateUserPreferences;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use Palaso\Utilities\CodeGuard;

class TranslateProjectCommands
{
    /**
     * Create or update project
     * @param string $projectId
     * @param string $userId
     * @param array $data
     * @param array $mockResponses
     * @return string
     * @throws UserUnauthorizedException
     * @throws \Exception
     * @internal param $array <projectModel> $data
     */
    public static function updateProject($projectId, $userId, $data, array $mockResponses = [])
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
            if (array_key_exists('userPreferences', $data['config'])) {
                self::decodeUserPreferences($project->config->usersPreferences, $userId, $data['config']['userPreferences']);
            }
        }

        if (self::isNewProject($data)) {
            self::createMachineTranslationProject($project, $mockResponses);
        } elseif ($hasMachineTranslationProjectChanged) {
            self::removeMachineTranslationProject($project, $mockResponses);
            self::createMachineTranslationProject($project, $mockResponses);
        }

        return $project->write();
    }

    /**
     * @param string $projectId
     * @param array $configData
     * @param array $mockResponses
     * @return string
     */
    public static function updateConfig($projectId, $configData, array $mockResponses = [])
    {
        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);

        $hasMachineTranslationProjectChanged = self::hasMachineTranslationProjectChanged($project, ['config' => $configData]);
        self::decodeConfig($project->config, $configData);

        if ($hasMachineTranslationProjectChanged) {
            self::removeMachineTranslationProject($project, $mockResponses);
            self::createMachineTranslationProject($project, $mockResponses);
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

        self::decodeUserPreferences($project->config->usersPreferences, $userId, $data);

        return $project->write();
    }

    /**
     * @param TranslateProjectModel $project
     * @param array $mockResponses
     */
    public static function createMachineTranslationProject($project, array $mockResponses = [])
    {
        CodeGuard::checkEmptyAndThrow($project->config->source->inputSystem->tag, 'project->config->source->inputSystem->tag');
        CodeGuard::checkEmptyAndThrow($project->config->target->inputSystem->tag, 'project->config->target->inputSystem->tag');
        if (empty($mockResponses)) {
            $handlerStack = HandlerStack::create();
        } else {
            $handlerStack = HandlerStack::create(new MockHandler($mockResponses));
        }

        $client = new Client(['handler' => $handlerStack]);
        $url = 'http://localhost/machine/translation/projects';
        $newProject = [
            'id' => $project->id->asString(),
            'sourceLanguageTag' => $project->config->source->inputSystem->tag,
            'targetLanguageTag' => $project->config->target->inputSystem->tag,
            'isShared' => !!$project->config->isTranslationDataShared
        ];
        if (!$project->config->isTranslationDataScripture) {
            $newProject['sourceSegmentType'] = 'latin';
            $newProject['targetSegmentType'] = 'latin';
        }
        $postData = ['json' => $newProject];
        $client->post($url, $postData);
    }

    /**
     * @param TranslateProjectModel $project
     * @param array $mockResponses
     */
    public static function removeMachineTranslationProject($project, array $mockResponses = [])
    {
        if (empty($mockResponses)) {
            $handlerStack = HandlerStack::create();
        } else {
            $handlerStack = HandlerStack::create(new MockHandler($mockResponses));
        }

        $client = new Client(['handler' => $handlerStack]);
        $url = 'http://localhost/machine/translation/projects/id:' . $project->id->asString();
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
            if (array_key_exists('isTranslationDataScripture', $data['config']) &&
                !!$data['config']['isTranslationDataScripture'] != !!$project->config->isTranslationDataScripture
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

    /**
     * @param MapOf $usersPreferences
     * @param string $userId
     * @param array $data
     */
    private static function decodeUserPreferences($usersPreferences, $userId, $data)
    {
        if (array_key_exists('selectedDocumentSetId', $data) ||
            array_key_exists('isDocumentOrientationTargetRight', $data) ||
            array_key_exists('isFormattingOptionsShown', $data) ||
            array_key_exists('hasConfidenceOverride', $data) ||
            array_key_exists('confidenceThreshold', $data)
        ) {
            if (!array_key_exists($userId, $usersPreferences)) {
                $usersPreferences[$userId] = new TranslateUserPreferences();
            }

            if (array_key_exists('selectedDocumentSetId', $data)) {
                $usersPreferences[$userId]->selectedDocumentSetId = $data['selectedDocumentSetId'];
            }

            if (array_key_exists('isDocumentOrientationTargetRight', $data)) {
                $usersPreferences[$userId]->isDocumentOrientationTargetRight = $data['isDocumentOrientationTargetRight'];
            }

            if (array_key_exists('isFormattingOptionsShown', $data)) {
                $usersPreferences[$userId]->isFormattingOptionsShown = $data['isFormattingOptionsShown'];
            }

            if (array_key_exists('hasConfidenceOverride', $data)) {
                $usersPreferences[$userId]->hasConfidenceOverride = $data['hasConfidenceOverride'];
            }

            if (array_key_exists('confidenceThreshold', $data)) {
                $usersPreferences[$userId]->confidenceThreshold = $data['confidenceThreshold'];
            }
        }
    }
}
