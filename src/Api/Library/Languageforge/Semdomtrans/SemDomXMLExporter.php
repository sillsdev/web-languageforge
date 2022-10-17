<?php

namespace Api\Library\Languageforge\Semdomtrans;

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Shared\Mapper\ArrayOf;

class SemDomXMLExporter
{
    private $_projectModel;

    private $_xml;

    private $_runForReal;

    private $_lang;

    private $_isEnglishXMLFormat;

    private $_recreateXMLFile;

    /**
     *
     * @param string $xmlfilepath
     * @param SemDomTransProjectModel $projectModel
     * @param bool $testMode
     */
    public function __construct($projectModel, $testMode = true, $isEnglishXMLFormat = true, $recreateXMLFile = false)
    {
        $this->_xml = simplexml_load_file($projectModel->xmlFilePath);
        $this->_projectModel = $projectModel;
        $this->_runForReal = !$testMode;
        $this->_lang = $projectModel->languageIsoCode;
        $this->_isEnglishXMLFormat = $isEnglishXMLFormat;
        $this->_recreateXMLFile = $recreateXMLFile;
    }

    public function run()
    {
        $possibilities = $this->_isEnglishXMLFormat
            ? $this->_xml->SemanticDomainList->CmPossibilityList->Possibilities
            : $this->_xml->xpath("List[@field='SemanticDomainList']")[0]->Possibilities;

        foreach ($possibilities->children() as $domainNode) {
            $this->_processDomainNode($domainNode);
        }

        if ($this->_runForReal) {
            $this->_xml->asXml(
                $this->_projectModel->getAssetsFolderPath() . "/" . $this->_projectModel->projectCode . "Export.xml"
            );
        }
    }

    public function _getPathVal($xmlPath)
    {
        if ($xmlPath) {
            $val = (string) $xmlPath[0];
        } else {
            $val = "";
        }
        return $val;
    }

    public function _getNodeOrNull($xmlPath)
    {
        if ($xmlPath) {
            $val = $xmlPath[0];
        } else {
            $val = null;
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
    public static function _addChild($to, $from)
    {
        $toDom = dom_import_simplexml($to);
        $fromDom = dom_import_simplexml($from);
        $toDom->appendChild($toDom->ownerDocument->importNode($fromDom, true));
    }
    private function _processDomainNode($domainNode)
    {
        if ($this->_xml) {
            $guid = (string) $domainNode["guid"];
        }

        $s = new SemDomTransItemModel($this->_projectModel);
        $s->readByProperty("xmlGuid", $guid);
        $abbreviation = $this->_getPathVal($domainNode->xpath("Abbreviation/AUni[@ws='en']"));
        // if XML file does not have to be recreated, just assign to appropriate fields
        // if XML has to be recreated, then add appropriate children nodes to XML file
        if (!$this->_recreateXMLFile) {
            $name = $domainNode->xpath("Name/AUni[@ws='{$this->_lang}']")[0];
            $description = $domainNode
                ->xpath("Description/AStr[@ws='{$this->_lang}']")[0]
                ->xpath("Run[@ws='{$this->_lang}']")[0];

            $name[0] = SemDomTransStatus::isApproved($s->name->status) ? $s->name->translation : "";
            $description[0] = SemDomTransStatus::isApproved($s->description->status)
                ? $s->description->translation
                : "";
        } else {
            $name = $domainNode->Name;
            $nameChild = clone $domainNode->Name->AUni;
            $nameChild["ws"] = $this->_lang;
            $nameChild[0] = SemDomTransStatus::isApproved($s->name->status) ? $s->name->translation : "";
            SemDomXMLExporter::_addChild($name, $nameChild);

            $description = $domainNode->Description;
            $descriptionChild = clone $domainNode->Description->AStr;
            $descriptionChild["ws"] = $this->_lang;
            $descriptionChild->Run["ws"] = $this->_lang;
            $descriptionChild->Run[0] = SemDomTransStatus::isApproved($s->description->status)
                ? $s->description->translation
                : "";
            SemDomXMLExporter::_addChild($description, $descriptionChild);
        }

        $questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        $searchKeys = new ArrayOf(function ($data) {
            return new SemDomTransTranslatedForm();
        });

        if (property_exists($domainNode, "Questions")) {
            $questionsXML = $domainNode->Questions;

            // parse nested questions
            $index = 0;

            foreach ($questionsXML->children() as $questionXML) {
                // if XML file does not have to be recreated, just assign to appropriate fields
                // if XML has to be recreated, then add appropriate children nodes to XML file
                if (!$this->_recreateXMLFile) {
                    $question = $this->_getNodeOrNull($questionXML->xpath("Question/AUni[@ws='{$this->_lang}']"));
                    $terms = $this->_getNodeOrNull($questionXML->xpath("ExampleWords/AUni[@ws='{$this->_lang}']"));
                    if ($question != null && SemDomTransStatus::isApproved($s->questions[$index]->question->status)) {
                        $question[0] = $s->questions[$index]->question->translation;
                    } else {
                        $question[0] = "";
                    }
                    if ($terms != null && SemDomTransStatus::isApproved($s->questions[$index]->question->status)) {
                        $terms[0] = $s->questions[$index]->terms->translation;
                    }
                } else {
                    $question = $questionXML->Question;
                    $terms = $questionXML->ExampleWords;
                    if (!empty($question)) {
                        $questionChild = clone $question->AUni;
                        $questionChild["ws"] = $this->_lang;
                        if (SemDomTransStatus::isApproved($s->questions[$index]->question->status)) {
                            $questionChild[0] = $s->questions[$index]->question->translation;
                        } else {
                            $questionsChild[0] = "";
                        }
                        SemDomXMLExporter::_addChild($question, $questionChild);
                    }
                    if (!empty($terms)) {
                        $termsChild = clone $terms->AUni;
                        $termsChild["ws"] = $this->_lang;
                        if (SemDomTransStatus::isApproved($s->questions[$index]->terms->status)) {
                            $termsChild[0] = $s->questions[$index]->question->translation;
                        } else {
                            $termsChild[0] = "";
                        }
                        $termsChild[0] = $s->questions[$index]->terms->translation;
                        SemDomXMLExporter::_addChild($terms, $termsChild);
                    }
                }
                $index++;
            }
        }

        //print "Processed $abbreviation \n";

        // recurse on sub-domains
        if (property_exists($domainNode, "SubPossibilities")) {
            foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
                $this->_processDomainNode($subDomainNode);
            }
        }
    }
}
