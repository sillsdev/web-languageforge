<?php

namespace models\languageforge;


use models\languageforge\semdomtrans\SemDomTransItemModel;

use models\languageforge\semdomtrans\SemDomTransItemListModel;

use models\ProjectModel;

use models\mapper\IdReference;

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
     * Create a new project pre-loaded with all semantic domain items
     */
    public static function createPreFilled() {
    	$latestSemdomVersion = 4;
    	$project = new SemDomTransProjectModel();
    	$englishProject = SemDomTransProjectModel::readByProperties(array('languageIsoCode' => 'en', 'semdomVersion' => $latestSemdomVersion));
    	$projectId = $project->write();
    	$englishItems = new SemDomTransItemListModel($englishProject);
    	$englishItems->read();
    	foreach ($englishItems->entries as $item) {
    		$newItem = new SemDomTransItemModel($project);
    		$newItem->key = $item['key'];
    		$newItem->write();
    	}
    }
    
    

} 