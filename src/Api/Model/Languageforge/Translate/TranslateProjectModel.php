<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Languageforge\Translate\Command\TranslateProjectCommands;
use Api\Model\Shared\Mapper\MongoStore;
use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\FileUtilities;

class TranslateProjectModel extends LfProjectModel
{
    const SENDRECEIVE_PATH = '/var/lib/languageforge/translate/sendreceive';

    public function __construct($id = '')
    {
        $this->appName = LfProjectModel::TRANSLATE_APP;
        $this->rolesClass = 'Api\Model\Languageforge\Translate\TranslateRoles';
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
            'userLanguageCode' => 'en',
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
        $projectPath = self::SENDRECEIVE_PATH . DIRECTORY_SEPARATOR . $this->projectCode;
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
