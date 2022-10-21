<?php

namespace Api\Library\Languageforge\Semdomtrans;

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Shared\Mapper\ArrayOf;

class SemDomXMLImporter
{
    private $_projectModel;

    private $_xml;

    private $_runForReal;

    private $_lang;

    private $_isEnglish;

    //    private $_outputFile;

    /**
     *
     * @param string $xmlfilepath
     * @param SemDomTransProjectModel $projectModel
     * @param bool $testMode
     */
    public function __construct($xmlfilepath, $projectModel, $testMode = true, $isEnglish = true)
    {
        $this->_xml = simplexml_load_file($xmlfilepath);
        $this->_projectModel = $projectModel;
        $this->_runForReal = !$testMode;
        $this->_lang = $projectModel->languageIsoCode;
        $this->_isEnglish = $isEnglish;
        //$this->_outputFile =  fopen(APPPATH . "resources/languageforge/semdomtrans/GoogleTranslateHarvester/" . $projectModel->languageIsoCode. "UnprocessedList.txt","w");
    }

    public function run($english = true)
    {
        $possibilities = $this->_isEnglish
            ? $this->_xml->SemanticDomainList->CmPossibilityList->Possibilities
            : $this->_xml->xpath("List[@field='SemanticDomainList']")[0]->Possibilities;

        foreach ($possibilities->children() as $domainNode) {
            $this->_processDomainNode($domainNode);
        }
    }

    /**
     * Check if given xml path has value
     * @param XmlPath $xmlPath
     * @return string
     */
    public function _getPathVal($xmlPath)
    {
        if ($xmlPath) {
            $val = (string) $xmlPath[0];
        } else {
            $val = "";
        }
        return $val;
    }

    /**
     * Recursively goes through each node and:
     * 1) pulls out its values (name, description, questions, search keys) and creates SemDomTransItem from them
     * 2) Recurses on all direct children (e.g. for 1 we would recurse on 1.1, 1.2, .... 1.5, not 1.1.1)
     *
     * Note: all values that are parsed are printed to file storing list of words/phrases/sentences that Google Translate Harvester
     * can later use.
     * @param SimpleXMLNode $domainNode
     * @return SemDomTransQuestion|SemDomTransTranslatedForm
     */
    private function _processDomainNode($domainNode)
    {
        $guid = (string) $domainNode["guid"];

        // retrieve name
        $name = $this->_getPathVal($domainNode->xpath("Name/AUni[@ws='{$this->_lang}']"));
        //        fwrite($this->_outputFile, $name . "\n");

        // retrieve abbrevation
        $abbreviation = $this->_getPathVal($domainNode->xpath("Abbreviation/AUni[@ws='en']"));

        //retrieve description
        $description = $this->_getPathVal(
            $domainNode->xpath("Description/AStr[@ws='{$this->_lang}']")[0]->xpath("Run[@ws='{$this->_lang}']")
        );
        //        fwrite($this->_outputFile, $description . "\n");

        $questions = new ArrayOf(function () {
            return new SemDomTransQuestion();
        });
        $searchKeys = new ArrayOf(function () {
            return new SemDomTransTranslatedForm();
        });

        // process question
        if (property_exists($domainNode, "Questions")) {
            $questionsXML = $domainNode->Questions->children();

            // parse nested questions
            foreach ($questionsXML as $questionXML) {
                $question = $this->_getPathVal($questionXML->xpath("Question/AUni[@ws='{$this->_lang}']"));
                //                fwrite($this->_outputFile, $question . "\n");

                $terms = $this->_getPathVal($questionXML->xpath("ExampleWords/AUni[@ws='{$this->_lang}']"));
                //                fwrite($this->_outputFile, $terms . "\n");

                $q = new SemDomTransQuestion($question, $terms);
                $sk = new SemDomTransTranslatedForm($terms);

                // if question is non-empty in XML file, set as approved
                if ($question != "") {
                    $q->question->status = SemDomTransStatus::Approved;
                }

                // if question terms is non-empty in XML file, set as approved
                if ($terms != "") {
                    $q->terms->status = SemDomTransStatus::Approved;
                    $sk->status = SemDomTransStatus::Approved;
                }

                $questions[] = $q;
                $searchKeys[] = $sk;
            }
        }

        // assume that we are not matching up with guids
        $itemModel = new SemDomTransItemModel($this->_projectModel);
        $itemModel->readByProperty("xmlGuid", $guid);

        $itemModel->xmlGuid = $guid;
        $itemModel->name = new SemDomTransTranslatedForm($name);

        // if name is non-empty in XML file, set as approved
        if ($name != "") {
            $itemModel->name->status = SemDomTransStatus::Approved;
        }

        $itemModel->key = $abbreviation;

        $itemModel->description = new SemDomTransTranslatedForm($description);

        // if description is non-empty in XML file, set as approved
        if ($description != "") {
            $itemModel->description->status = SemDomTransStatus::Approved;
        }

        $itemModel->questions = $questions;
        $itemModel->searchKeys = $searchKeys;
        //print_r($itemModel->questions);

        if ($this->_runForReal) {
            $itemModel->write();
        }
        //print "Processed $abbreviation $name\n";

        // recurse on sub-domains
        if (property_exists($domainNode, "SubPossibilities")) {
            foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
                $this->_processDomainNode($subDomainNode);
            }
        }
    }
}
