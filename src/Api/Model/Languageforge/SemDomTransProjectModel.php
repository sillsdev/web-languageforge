<?php

namespace Api\Model\Languageforge;

use Api\Library\Languageforge\Semdomtrans\SemDomXMLImporter;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\Id;

class SemDomTransProjectModel extends LfProjectModel {

    const SEMDOM_VERSION = 4;

    public function __construct($id = '')
    {
        $this->rolesClass = 'Api\Model\Languageforge\Semdomtrans\SemDomTransRoles';
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

    public function preFillFromSourceLanguage($useGoogleTranslateData = true) {
        
        $path = APPPATH . "resources/languageforge/semdomtrans/GoogleTranslateHarvester/semdom-google-translate-$this->languageIsoCode.txt.gz";

        $googleTranslateData = [];
        if($useGoogleTranslateData && file_exists($path)) {
            $lines = gzfile($path);
            foreach ($lines as $line) {
                $splitLine = explode("|", $line);
                if (count($splitLine) == 2) {
                    $googleTranslateData[$splitLine[0]] = $splitLine[1];
                }
            }
        }
       
        // cjh review: we may actually want to only prefill from English, if in the future we allow creating projects from incomplete source projects        
        $sourceProject = new SemDomTransProjectModel($this->sourceLanguageProjectId->asString());

        $this->_copyXmlToAssets($sourceProject->xmlFilePath);

        $sourceItems = new SemDomTransItemListModel($sourceProject);
        $sourceItems->read();
        foreach ($sourceItems->entries as $item) {
            $newItem = new SemDomTransItemModel($this);
            
            // if Google translation exists for given name exists, use it
            if (array_key_exists($item['name']['translation'], $googleTranslateData)) {
                $newItem->name->translation = $googleTranslateData[$item['name']['translation']];    
                $newItem->name->status = SemDomTransStatus::Suggested;
            }
            // if Google translation exists for given description exists, use it
            if (array_key_exists($item['description']['translation'], $googleTranslateData)) {
                $newItem->description->translation = $googleTranslateData[$item['description']['translation']];
                $newItem->description->status = SemDomTransStatus::Suggested;
            }
            
            $newItem->key = $item['key'];
            for($x=0; $x<count($item['questions']); $x++) {
                $q = new SemDomTransQuestion();
                // if Google translation exists for given question, use it
                if (array_key_exists($item['questions'][$x]['question']['translation'], $googleTranslateData)) {
                    $q->question->translation = $googleTranslateData[$item['questions'][$x]['question']['translation']];
                    $q->question->status = SemDomTransStatus::Suggested;
                } 
                // if Google translation exists for given question term, use it
                if (array_key_exists($item['questions'][$x]['terms']['translation'], $googleTranslateData)) {
                    $q->terms->translation = $googleTranslateData[$item['questions'][$x]['terms']['translation']];
                    $q->terms->status = SemDomTransStatus::Suggested;
                }
                $newItem->questions[] = $q;
            }
            for($x=0; $x<count($item['searchKeys']); $x++) {
                $sk = new SemDomTransTranslatedForm();
                // if Google translation exists for given search key, use it
                if (array_key_exists($item['searchKeys'][$x]['translation'], $googleTranslateData)) {
                    $sk->translation = $googleTranslateData[$item['searchKeys'][$x]['translation']];
                    $sk->status = SemDomTransStatus::Suggested;
                }
                $newItem->searchKeys[] = $sk;
            }
            $newItem->xmlGuid = $item['xmlGuid'];
            $newItem->write();
        }
    }

    public static function projectCode($languageCode, $semdomVersion = self::SEMDOM_VERSION) {
        return "semdom-$languageCode-$semdomVersion";
    }
    
    public static function projectName($languageCode, $languageName, $semdomVersion = self::SEMDOM_VERSION) {
        return "Semantic Domain $languageName ($languageCode) Translation";
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
