<?php

namespace Api\Model\Languageforge\Translate;

use Api\Model\Languageforge\InputSystem;
use Api\Model\Languageforge\LfProjectModel;

class TranslateProjectModel extends LfProjectModel
{
    public function __construct($id = '')
    {
        $this->appName = LfProjectModel::TRANSLATE_APP;
        $this->rolesClass = 'Api\Model\Languageforge\Translate\TranslateRoles';

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    /** @var InputSystem */
    public $sourceInputSystem;

    /** @var InputSystem */
    public $targetInputSystem;

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

        return $settings;
    }

    /**
     * Create assets folders
     */
    public function initializeNewProject()
    {
    }

}
