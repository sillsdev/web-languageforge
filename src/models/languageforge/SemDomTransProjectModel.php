<?php

namespace models\languageforge;


use models\languageforge\semdomtrans\SemDomTransItemModel;

use models\languageforge\semdomtrans\SemDomTransItemListModel;

use models\ProjectModel;

use models\mapper\IdReference;
use models\languageforge\semdomtrans\SemDomTransQuestion;


class SemDomTransProjectModel extends LfProjectModel {
    public function __construct($id = '')
    {
        $this->rolesClass = 'models\languageforge\semdomtrans\SemDomTransRoles';
        $this->appName = LfProjectModel::SEMDOMTRANS_APP;

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
     * @var IdReference
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
    
    public static function createProject($languageCode, $semdomVersion) {
        $project = new SemDomTransProjectModel();
        $project->languageIsoCode = $languageCode;
        $project->projectName = "Semdom $languageCode Project";
        $project->projectCode = "semdom-$languageCode-$semdomVersion";
        $project->semdomVersion = $semdomVersion;
        $project->write();
        return $project;
    }
} 