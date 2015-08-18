<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\LanguageData;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Mapper\MapOf;

class LexiconProjectModel extends LfProjectModel
{
    public function __construct($id = '')
    {
        $this->appName = LfProjectModel::LEXICON_APP;
        $this->rolesClass = 'Api\Model\Languageforge\Lexicon\LexiconRoles';
        $this->inputSystems = new MapOf(
            function ($data) {
                return new InputSystem();
            }
        );

        $this->config = new LexConfiguration();

        // default values
        $this->inputSystems['en'] = new InputSystem('en', 'English', 'en');
        $this->inputSystems['th'] = new InputSystem('th', 'Thai', 'th');
        $this->languageCode = $this->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems[0];

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    /**
     *
     * @var MapOf <InputSystem>
     */
    public $inputSystems;

    /**
     *
     * @var LexConfiguration
     */
    public $config;

    /**
     *
     * @var string
     */
    public $liftFilePath;

    /**
     * Adds an input system if it doesn't already exist
     * @param string $tag
     * @param string $abbr
     * @param string $name
     */
    public function addInputSystem($tag, $abbr = '', $name = '')
    {
        static $languages = null;
        if (! key_exists($tag, $this->inputSystems)) {
            if (! $abbr) {
                $abbr = $tag;
            }
            if (! $name) {
                $name = $tag;
                if (!$languages) {
                    $languages = new LanguageData();
                }
                $languageCode = LanguageData::getCode($tag);
                if (key_exists($languageCode, $languages)) {
                    $name = $languages[$languageCode]->name;
                }
            }
            $this->inputSystems[$tag] = new InputSystem($tag, $name, $abbr);
        }
    }

    public function getPublicSettings($userId)
    {
        $settings = parent::getPublicSettings($userId);
        $settings['currentUserRole'] = $this->users[$userId]->role;

        return array_merge($settings, LexBaseViewDto::encode($this->id->asString(), $userId));
    }

    /**
     * Initialize the optionlists in a project
     */
    public function initializeNewProject()
    {
        // setup default option lists
        $optionList = new LexOptionListModel($this);
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::POS);
        if (! $optionList->readByProperty('code', $listCode)) {
            $optionList->name = LexiconConfigObj::flexOptionlistName($listCode);
            $optionList->code = $listCode;
            $optionList->canDelete = false;
            $optionList->readFromJson(APPPATH . 'json/languageforge/lexicon/partOfSpeech.json');
            $optionList->write();
        }

        /*
        $optionList = new LexOptionListModel($this);
        $optionList->name = 'Semantic Domains';
        $optionList->code = 'semdom';
        $optionList->canDelete = false;
        $optionList->readFromJson(APPPATH . 'json/languageforge/lexicon/semdom.json');
        $optionList->write();

        // we should have a default list for every delivered field that is an option list type
        $optionList = new LexOptionListModel($this);
        $optionList->name = 'Environments';
        $optionList->code = 'environments';
        $optionList->canDelete = false;
        $optionList->readFromJson($environmentsFilePath);
        $optionList->write();
        */

        // repeat for other delivered option list types

    }

}
