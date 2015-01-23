<?php

namespace models\languageforge\semdomtrans;

use models\mapper\MapOf;

use models\languageforge\SemDomTransProjectModel;
use models\mapper\ArrayOf;

class SemDomTransItemModel extends \models\mapper\MapperModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'semDomTransItems');
        }

        return $instance;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string       $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->key = "";
        $this->name = new TranslatedForm();
        $this->description = new TranslatedForm();
        $this->searchKeys = new ArrayOf(function ($data) {
        	return new TranslatedForm();
        });
        
        $this->questions = new ArrayOf(function ($data) {
        	return new TranslatedForm();
        });
        
        $this->language = "";
        
        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /**
     * @var Id
     */
    public $id;
    
    /**
     * @var string
     */
    public $key;
    
    /**
     * @var TranslatedForm
     */
    public $name;
    
    /**
     * @var TranslatedForm
     */
    public $description;
    
    /**
     * @var ArrayOf(TranslatedForm)
     */
    public $searchKeys;
    
    /**
     * @var ArrayOf(TranslatedForm)
     */
    public $questions;
    
    /**
     * @var string
     */
    public $language;    
 }
