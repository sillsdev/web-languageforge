<?php
namespace models\languageforge\semdomtrans;

class SemDomTransFieldReference {
    public function __construct($fieldName = '', $sourceVal = '', $translationVal = '', $status = 0) { 
        $this->fieldName = $fieldName;
        $this->sourceVal = $sourceVal;
        $this->translationVal = $translationVal;
        $this->status = $status;
    }

    /**
     * @var string
     */
    public $fieldName;

    /**
     * @var string
     */
    public $sourceVal;
    
    /**
     * @var string
     */
    public $translationVal;
    
    
    /**
     * @var SemDomTransStatus
     */
    public $status;   
}