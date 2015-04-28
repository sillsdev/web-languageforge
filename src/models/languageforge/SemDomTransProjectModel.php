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
        $this->semdomVersion = self::SEMDOM_VERSION;
        $this->sourceLanguageProjectId = new IdReference();
        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

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
        $existingItems = new SemDomTransItemListModel($this);
        $existingItems->deleteAll();

        $this->_copyXmlToAssets($xmlFilePath);

        $importer = new SemDomXMLImporter($this->xmlFilePath, $this, false, $isEnglish);
        $importer->run();
    }

    public function preFillFromSourceLanguage() {
        // cjh review: we may actually want to only prefill from English, if in the future we allow creating projects from incomplete source projects
        $sourceProject = new SemDomTransProjectModel($this->sourceLanguageProjectId->asString());

        $this->_copyXmlToAssets($sourceProject->xmlFilePath);

        $sourceItems = new SemDomTransItemListModel($sourceProject);
        $sourceItems->read();
        foreach ($sourceItems->entries as $item) {
            $newItem = new SemDomTransItemModel($this);
            $newItem->key = $item['key'];
            for($x=0; $x<count($item['questions']); $x++) {
                $newItem->questions[] = new SemDomTransQuestion();
            }
            for($x=0; $x<count($item['searchKeys']); $x++) {
                $newItem->searchKeys[] = new SemDomTransTranslatedForm();
            }
            $newItem->xmlGuid = $item['xmlGuid'];
            $newItem->write();
        }
    }

    public static function projectCode($languageCode, $semdomVersion = self::SEMDOM_VERSION) {
        return "semdom-$languageCode-$semdomVersion";
    }

    public function readByCode($languageCode, $semdomVersion = self::SEMDOM_VERSION) {
        $this->readByProperties(array("projectCode" => self::projectCode($languageCode, $semdomVersion)));
    }

    public static function getEnglishProject($semdomVersion = self::SEMDOM_VERSION) {
        $englishProject = new SemDomTransProjectModel();
        $englishProject->readByCode('en', $semdomVersion);
        if ($englishProject->id->asString() != '') {
            return $englishProject;
        } else {
            throw new \Exception('The semantic domain English project is assumed to already exist at this point...but it does not!');
        }
    }
} 