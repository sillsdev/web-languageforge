<?php

namespace models\languageforge;

use libraries\languageforge\semdomtrans\SemDomXMLImporter;
use models\languageforge\semdomtrans\SemDomTransItemListModel;
use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\mapper\IdReference;
use models\commands\ProjectCommands;
use models\mapper\Id;


class SemDomTransProjectModel extends LfProjectModel {

    const SEMDOM_VERSION = 4;

    public function __construct($id = '')
    {
        $this->rolesClass = 'models\languageforge\semdomtrans\SemDomTransRoles';
        $this->appName = LfProjectModel::SEMDOMTRANS_APP;
        $this->sourceLanguageProjectId = new IdReference();
        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }
    
    
    /**
     * 
     */
    const SEMDOMVERSION = 4;
    
    /**
     * 
     * @var boolean
     */
    public $isSourceLanguage;
    
    /**
     * 
     * @var Id
     */
    public $sourceLanguageProjectId;
    
    /**
     * 
     * @var string
     */
    public $languageName;
    
    /**
     * 
     * @var string
     */
    public $languageIsoCode;
    
    /**
     * The semantic domain version number of this language set
     * @var string
     */
    public $semdomVersion;
    
    /**
     * The path for the source XML file from which the project was imported
     * @var string
     */
    public $xmlFilePath;
    
    public static function createProject($languageCode, $userId, $website) {
        $englishProject = self::getEnglishProject();

        $version = SemDomTransProjectModel::SEMDOMVERSION;
        $projectCode = self::projectCode($languageCode, self::SEMDOM_VERSION);
        $projectName = "Semdom $languageCode Project";
        $projectID =  ProjectCommands::createProject($projectName, $projectCode, LfProjectModel::SEMDOMTRANS_APP, $userId, $website);
        
        $project = new SemDomTransProjectModel($projectID);
        $project->projectCode = $projectCode;
        $project->projectName = $projectName;
        $project->languageIsoCode = $languageCode;
        $project->semdomVersion = $version;
        $project->isSourceLanguage = false;
        $project->sourceLanguageProjectId->id = $englishProject->id->asString();
        $project->write();
        
        return $project;
    }

    private function _copyXmlToAssets($xmlFilePath) {
        $newXmlFilePath = $this->getAssetsFolderPath() . '/' . basename($xmlFilePath);
        if (!file_exists($this->getAssetsFolderPath())) {
            mkdir($this->getAssetsFolderPath());
        }

        copy($xmlFilePath, $newXmlFilePath);
        $this->xmlFilePath = $newXmlFilePath;
        $this->write();
    }

    public function importFromFile($xmlFilePath, $isEnglish = false) {
        $this->_copyXmlToAssets($xmlFilePath);

        $importer = new SemDomXMLImporter($this->xmlFilePath, $this, false, $isEnglish);
        $importer->run();
    }

    public function preFillFromSourceLanguage() {
        $sourceProject = new SemDomTransProjectModel($this->sourceLanguageProjectId->asString());

        $this->_copyXmlToAssets($sourceProject->xmlFilePath);

        $sourceItems = new SemDomTransItemListModel($sourceProject);
        $sourceItems->read();
        foreach ($sourceItems->entries as $item) {
            $newItem = new SemDomTransItemModel($this);
            $newItem->key = $item['key'];
            foreach ($item['questions'] as $q) {
                $newq = new SemDomTransQuestion("aa", "aa");
                $newItem->questions[] = $newq;
            }
            foreach ($item['searchKeys'] as $sk) {
                $newsk = new SemDomTransTranslatedForm();
                $newItem->searchKeys[] = $newsk;
            }
            $newItem->xmlGuid = $item['xmlGuid'];
            $newItem->write();
        }
    }

    public static function projectCode($languageCode) {
        return "semdom-$languageCode-" . self::SEMDOM_VERSION;
    }

    public function readByCode($languageCode) {
        $this->readByProperties(array("projectCode" => self::projectCode($languageCode, self::SEMDOM_VERSION)));
    }

    public static function getEnglishProject() {
        $englishProject = new SemDomTransProjectModel();
        $englishProject->readByCode('en');
        if ($englishProject->id->asString() != '') {
            return $englishProject;
        } else {
            throw new \Exception('The semantic domain English project is assumed to already exist at this point...but it does not!');
        }
    }
} 