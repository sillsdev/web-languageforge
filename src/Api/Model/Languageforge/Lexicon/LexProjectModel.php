<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\LanguageData;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Mapper\MapOf;
use Palaso\Utilities\FileUtilities;

class LexProjectModel extends LfProjectModel
{
    public function __construct($id = '')
    {
        $this->appName = LfProjectModel::LEXICON_APP;
        $this->rolesClass = 'Api\Model\Languageforge\Lexicon\LexRoles';
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
        $this->languageCode = $this->config->entry->fields[LexConfig::LEXEME]->inputSystems[0];

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

    /** @var MapOf <InputSystem> */
    public $inputSystems;

    /** @var LexConfiguration */
    public $config;

    /** @var string */
    public $liftFilePath;

    /** @var string Language Depot project identifier (this is here for DB queries) */
    public $sendReceiveProjectIdentifier;

    /** @var SendReceiveProjectModel */
    public $sendReceiveProject;

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
        return ($this->sendReceiveProjectIdentifier) ? true : false;
    }

    /**
     * Initialize the default option lists and create assets folders
     */
    public function initializeNewProject()
    {
        // setup default option lists
        $jsonFilePath = APPPATH . 'json/languageforge/lexicon/partOfSpeech.json';
        LexOptionListModel::CreateFromJson($this, LexConfig::POS, $jsonFilePath);

        // Semantic Domains are delivered to the client as a javascript variable.

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

    /**
     * Cleanup associated project files
     */
    protected function cleanup()
    {
        parent::cleanup();

        if (!is_null($this->projectCode)) {
            $projectFilename = strtolower($this->projectCode);
            $stateFilename = strtolower($this->projectCode) . '.state';
            $lfmergePaths = SendReceiveCommands::getLFMergePaths();

            foreach($lfmergePaths as $key => $path) {
                if (!is_null($path)) {
                    if ($key == "workPath") {
                        FileUtilities::removeFolderAndAllContents($lfmergePaths->workPath . DIRECTORY_SEPARATOR . $projectFilename);
                    }

                    if (file_exists($path . DIRECTORY_SEPARATOR . $projectFilename)) {
                        unlink($path . DIRECTORY_SEPARATOR . $projectFilename);
                    }
                    if (file_exists($path . DIRECTORY_SEPARATOR . $stateFilename)) {
                        unlink($path . DIRECTORY_SEPARATOR . $stateFilename);
                    }
                }
            }
        }
    }

}
