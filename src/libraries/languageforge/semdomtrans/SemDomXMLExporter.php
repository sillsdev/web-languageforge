<?php

namespace libraries\languageforge\semdomtrans;

use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\mapper\ArrayOf;
use models\mapper\JsonEncoder;
class SemDomXMLExporter {
    
    private $_projectModel;
    
    private $_xml;
    
    private $_runForReal;
    
    private $_lang;
    
    private $_isEnglish;
    
    private $_useTemplateXML;
    
    /**
     * 
     * @param string $xmlfilepath
     * @param SemDomTransProjectModel $projectModel
     * @param bool $testMode
     */
    public function __construct($projectModel, $testMode = true, $isEnglish = true, $useTemplateXML = false) {

        $this->_xml = simplexml_load_file($projectModel->xmlFilePath);
        $this->_projectModel = $projectModel;
        $this->_runForReal = ! $testMode;
        $this->_lang = $projectModel->languageIsoCode;
        $this->_isEnglish = $isEnglish;
        $this->_useTemplateXML = $useTemplateXML;
    }
    
    public function run() {

        $possibilities = $this->_isEnglish ? 
            $this->_xml->SemanticDomainList->CmPossibilityList->Possibilities 
            : $this->_xml->xpath("List[@field='SemanticDomainList']")[0]->Possibilities;
        
        foreach($possibilities->children() as $domainNode) {
            $this->_processDomainNode($domainNode);
        }

        if ($this->_runForReal) {
            $this->_xml->asXml($this->_projectModel->getAssetsFolderPath() . "/" . $this->_projectModel->projectCode . "Export.xml");
        }
    }

    public function _getPathVal($xmlPath) {
        if ($xmlPath) {
            $val = (string) $xmlPath[0];
        } else {
            $val= "";
        }
        return $val;
    }
    
    public function _getNodeOrNull($xmlPath) {
        if ($xmlPath) {
            $val = $xmlPath[0];
        } else {
            $val= null;
        }
        return $val;
    }
    
    
    /*
        SimpleXML does not handle the adding of complex XML elements as children of other XML elements
        This method works around this by exporting relevant the simplexml nodes to dom format and then 
         doing the adding through the dom library.

        More details: http://stackoverflow.com/questions/4778865/php-simplexml-addchild-with-another-simplexmlelement
        
        Alternatives: use other library than SimpleXML. This is feasible but SimpleXML is very nice for all the other things we are doing, so this work around is probably best at this point
     */
    public static function _addChild($to, $from) {
        $toDom = dom_import_simplexml($to);
        $fromDom = dom_import_simplexml($from);
        $toDom->appendChild($toDom->ownerDocument->importNode($fromDom, true));
    }
    private function _processDomainNode($domainNode) {
        if ($this->_xml)
        $guid = (string)$domainNode['guid'];
        
        $s = new SemDomTransItemModel($this->_projectModel);
        $s->readByProperty("xmlGuid", $guid);        
        $abbreviation = $this->_getPathVal($domainNode->xpath("Abbreviation/AUni[@ws='en']"));
        if (!$this->_useTemplateXML) {
            $name = $domainNode->xpath("Name/AUni[@ws='{$this->_lang}']")[0];
            $description =  $domainNode->xpath("Description/AStr[@ws='{$this->_lang}']")[0]->xpath("Run[@ws='{$this->_lang}']")[0];
            
            $name[0] = $s->name->translation;
            $description[0] = $s->description->translation;
        } else {
            $name = $domainNode->Name;
            $nameChild = clone($domainNode->Name->AUni);
            $nameChild["ws"] = $this->_lang;
            $nameChild[0] = $s->name->translation;
            SemDomXMLExporter::_addChild($name, $nameChild);
            
            $description = $domainNode->Description;
            $descriptionChild = clone($domainNode->Description->AStr);
            $descriptionChild["ws"] = $this->_lang;
            $descriptionChild->Run["ws"] = $this->_lang;
            $descriptionChild->Run[0] = $s->description->translation;
            SemDomXMLExporter::_addChild($description, $descriptionChild);
        }
        
        $questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });      
        $searchKeys = new ArrayOf(function ($data) {
            return new SemDomTransTranslatedForm();
        });      
    
        if (property_exists($domainNode, 'Questions'))
        {
            $questionsXML = $domainNode->Questions;
            
            // parse nested questions
            $index = 0;

            foreach ( $questionsXML->children() as $questionXML ) {
                

                if (!$this->_useTemplateXML) {        
                    $question = $this->_getNodeOrNull ( $questionXML->xpath ( "Question/AUni[@ws='{$this->_lang}']" ) );
                    $terms = $this->_getNodeOrNull ( $questionXML->xpath ( "ExampleWords/AUni[@ws='{$this->_lang}']"));
                    if($question != null) {
                        $question[0] = $s->questions[$index]->question->translation;
                    }
                    if($terms != null) {
                        $terms[0] = $s->questions[$index]->terms->translation;
                    }
                } else {
                        $question = $questionXML->Question;
                        $terms = $questionXML->ExampleWords;
                        if (!empty($question)) {
                            $questionChild = clone($question->AUni);                            
                            $questionChild["ws"] = $this->_lang;
                            $questionChild[0] = $s->questions[$index]->question->translation;
                            SemDomXMLExporter::_addChild($question, $questionChild);
                        }
                         if (!empty($terms)) {
                            $termsChild = clone($terms->AUni);
                            $termsChild["ws"] = $this->_lang;
                            $termsChild[0] = $s->questions[$index]->terms->translation;
                            SemDomXMLExporter::_addChild($terms, $termsChild);
                        }
                }
                $index++;
            }
        }                
        
        
        
        //print "Processed $abbreviation \n";
        
        // recurse on sub-domains
        if (property_exists($domainNode, 'SubPossibilities')) {
            foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
                $this->_processDomainNode($subDomainNode);
            }
        }
    }
    
}
?>