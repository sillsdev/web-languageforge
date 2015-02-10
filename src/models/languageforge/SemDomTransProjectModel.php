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
    public $newXmlFilePath;
    
    /**
     * Create a new project pre-loaded with all semantic domain items
     * @return ProjectModel
     */
    public static function createPreFilled($sourceProject, $languageIsoCode, $latestSemdomVersion) {
   	
    	$project = new SemDomTransProjectModel();
    	$project->languageIsoCode = $languageIsoCode;
    	$project->semdomVersion = $latestSemdomVersion;
    	$project->sourceLanguageProjectId = $sourceProject->id->asString();
    	$project->projectCode = "semdom-$languageIsoCode-$latestSemdomVersion";
    	$projectId = $project->write();
    	
    	$englishItems = new SemDomTransItemListModel($sourceProject);
    	$englishItems->read();
    	foreach ($englishItems->entries as $item) {
    		$newItem = new SemDomTransItemModel($project);
    		$newItem->key = $item['key'];
    		foreach ($item['questions'] as $q) {
    			$newq = new SemDomTransQuestion(); 
    			$newItem->questions[] = $newq;
    		}
    		foreach ($item['searchKeys'] as $sk) {
    			$newsk = new SemDomTransQuestion();
    			$newItem->searchKeys[] = $newsk;
    		}
    		$newItem->write();
    	}
    	return $project;
    }
} 