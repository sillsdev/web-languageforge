<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\LanguageData;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Mapper\MapOf;
use Palaso\Utilities\FileUtilities;

class LexiconProjectModel extends LfProjectModel
{
    public function __construct($id = '')
    {
        $this->appName = LfProjectModel::LEXICON_APP;
        $this->rolesClass = 'Api\Model\Languageforge\Lexicon\LexiconRoles';
        $this->inputSystems = new MapOf(
            function() {
                return new InputSystem();
            }
        );

        $this->config = new LexConfiguration();
        $this->sendReceiveProject = new SendReceiveProjectModel();

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
     *
     * @var SendReceiveProjectModel
     */
    public $sendReceiveProject;

    /**
     *
     * @var string
     */
    public $sendReceiveUsername;

    /**
     * Adds an input system if it doesn't already exist
     * @param string $tag
     * @param string $abbr
     * @param string $name
     */
    public function addInputSystem($tag, $abbr = '', $name = '')
    {
        static $languages = null;
        if (!array_key_exists($tag, $this->inputSystems)) {
            if (! $abbr) {
                $abbr = $tag;
            }
            if (! $name) {
                $name = $tag;
                if (!$languages) {
                    $languages = new LanguageData();
                }
                $languageCode = LanguageData::getCode($tag);
                if (array_key_exists($languageCode, $languages)) {
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
        $settings['hasSendReceive'] = $this->hasSendReceive();

        return array_merge($settings, LexBaseViewDto::encode($this->id->asString(), $userId));
    }

    /**
     * @return bool
     */
    public function hasSendReceive()
    {
        return ($this->sendReceiveProject->identifier) ? true : false;
    }

    /**
     * Initialize the default option lists and create assets folders
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

        $this->createAssetsFolders();
    }

    /**
     *
     * @param string $assetsFolderPath
     * @return string
     */
    public function getImageFolderPath($assetsFolderPath = null)
    {
        $assetsFolderPath || $assetsFolderPath = $this->getAssetsFolderPath();
        return $assetsFolderPath . DIRECTORY_SEPARATOR . 'pictures';
    }

    /**
     *
     * @param string $assetsFolderPath
     * @return string
     */
    public function getAudioFolderPath($assetsFolderPath = null)
    {
        $assetsFolderPath || $assetsFolderPath = $this->getAssetsFolderPath();
        return $assetsFolderPath . DIRECTORY_SEPARATOR . 'audio';
    }

    public function createAssetsFolders()
    {
        $assetImagePath = $this->getImageFolderPath();
        $assetAudioPath = $this->getAudioFolderPath();
        if ($this->hasSendReceive()) {
            $projectWorkPath = $this->getSendReceiveWorkFolder();

            $srImagePath = $projectWorkPath . DIRECTORY_SEPARATOR . 'LinkedFiles' . DIRECTORY_SEPARATOR . 'Pictures';
            $this->moveExistingFilesAndCreateSymlink($srImagePath, $assetImagePath);

            $srAudioPath = $projectWorkPath . DIRECTORY_SEPARATOR . 'LinkedFiles' . DIRECTORY_SEPARATOR . 'AudioVisual';
            $this->moveExistingFilesAndCreateSymlink($srAudioPath, $assetAudioPath);
        } else {
            FileUtilities::createAllFolders($assetImagePath);
            FileUtilities::createAllFolders($assetAudioPath);
        }
    }

    /**
     * @return null|string
     */
    public function getSendReceiveWorkFolder()
    {
        if ($this->hasSendReceive()) {
            return SendReceiveCommands::getLFMergePaths()->workPath . DIRECTORY_SEPARATOR . strtolower($this->projectCode);
        }
        return null;
    }

    /**
     * @param $targetPath
     * @param $linkPath
     */
    private function moveExistingFilesAndCreateSymlink($targetPath, $linkPath)
    {
        if (file_exists($linkPath)) {
            if (is_dir($linkPath) && !is_link($linkPath)) {
                FileUtilities::copyFolderTree($linkPath, $targetPath);
                FileUtilities::removeFolderAndAllContents($linkPath);
            } else {
                unlink($linkPath);
            }
        }
        FileUtilities::createAllFolders($targetPath);
        symlink($targetPath, $linkPath);
    }

}
