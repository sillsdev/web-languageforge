<?php

namespace Api\Model\Shared\Translate;

use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Translate\Command\TranslateProjectCommands;
use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\FileUtilities;

class TranslateProjectModel extends ProjectModel
{
    public function __construct($id = '')
    {
        $this->appName = ProjectModel::TRANSLATE_APP;
        $this->rolesClass = 'Api\Model\Shared\Translate\TranslateRoles';
        $this->config = new TranslateConfig();

        $this->lastSyncedDate = UniversalTimestamp::fromSecondsTimestamp(0);
        $this->setReadOnlyProp('lastSyncedDate');

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    /** @var TranslateConfig */
    public $config;

    /** @var UniversalTimestamp */
    public $lastSyncedDate;

    /**
     * @param string $userId
     * @return array
     */
    public function getPublicSettings($userId)
    {
        $settings = parent::getPublicSettings($userId);
        $settings['interfaceConfig'] = [
            'languageCode' => 'en',
            'selectLanguages' => [
                'options' => ['en' => 'English'],
                'optionsOrder' => ['en']
            ]
        ];
        $settings['lastSyncedDate'] = $this->lastSyncedDate->asDateTimeInterface()->format(\DateTime::RFC2822);

        return $settings;
    }

    /**
     * Drop this projects 'realtime' MongoDB database collections
     * Remove this project from the Machine Translation Engine
     */
    public function remove()
    {
        MongoStore::dropCollection('realtime', $this->databaseName());
        MongoStore::dropCollection('realtime', 'o_' . $this->databaseName());
        TranslateProjectCommands::removeMachineTranslationProject($this);
        $projectPath = SR_TRANSLATE_FOLDER . DIRECTORY_SEPARATOR . $this->id;
        FileUtilities::removeFolderAndAllContents($projectPath);
        parent::remove();
    }

    /**
     * Create assets folders
     */
    public function initializeNewProject()
    {
    }
}
