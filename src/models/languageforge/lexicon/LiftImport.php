<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\config\LexiconOptionListItem;
use models\mapper\ArrayOf;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\ZipImportErrorReport;

class LiftImport
{

    /**
     * Convert a DOMNode to an SXE node -- simplexml_import_node() won't actually work
     * @param unknown $node
     * @return unknown
     */
    public static function domNode_to_sxeNode($node)
    {
        $dom = new \DomDocument();
        $n = $dom->importNode($node, true); // expands the node for that particular guid
        $sxeNode = simplexml_import_dom($n);
        return $sxeNode;
    }

    /**
     * @param string $liftFilePath
     * @param LexiconProjectModel $projectModel
     * @param LiftMergeRule $mergeRule
     * @param boolean $skipSameModTime
     * @throws \Exception
     */
    public static function merge($liftFilePath, $projectModel, $mergeRule = LiftMergeRule::CREATE_DUPLICATES, $skipSameModTime = true, $deleteMatchingEntry = false)
    {
        ini_set('max_execution_time', 90); // Sufficient time to import webster.  TODO Make this async CP 2014-10
//         self::validate($xml);    // TODO Fix. The XML Reader validator doesn't work with <optional> in the RelaxNG schema. IJH 2014-03

        $entryList = new LexEntryListModel($projectModel);
        $entryList->read();

        $initialImport = $entryList->count == 0;

        // I consider this to be a stopgap to support importing of part of speech until we have a way to import lift ranges - cjh 2014-08
        $partOfSpeechValues = array();

        if ($initialImport) {
            // Do the following on first import (number of entries == 0

            // clear entry field input systems config if their are no entries (only use imported input systems)
            $projectModel->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems = new ArrayOf();
            $projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems = new ArrayOf();
            $projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems = new ArrayOf();
            $projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems = new ArrayOf();
            $projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems = new ArrayOf();
        }

        $reader = new \XMLReader();
        $reader->open($liftFilePath);
        $liftFileDir = dirname($liftFilePath);

        $liftDecoder = new LiftDecoder($projectModel);
        $liftRangeDecoder = new LiftRangeDecoder($projectModel);
        $liftRangeFiles = array(); // Keys: filenames. Values: parsed files.
        $liftRanges = array(); // Keys: @id attributes of <range> elements. Values: parsed <range> elements.

        while ($reader->read()) {
            if ($reader->nodeType == \XMLReader::ELEMENT && $reader->localName == 'range') {
                $node = $reader->expand();
                $rangeId = $node->attributes->getNamedItem('id')->textContent;
                $rangeHref = $node->attributes->getNamedItem('href')->textContent;
                $hrefPath = parse_url($rangeHref, PHP_URL_PATH);
                $rangeFilename = basename($hrefPath);
                if (array_key_exists($rangeFilename, $liftRangeFiles)) {
                    // We've parsed this file already, so just pull out the referenced range
                    if (isset($liftRanges[$rangeId])) {
                        $range = $liftRanges[$rangeId];
                    } else {
                        // Range was NOT found in referenced .lift-ranges file
                        $rangeNode = LiftImport::domNode_to_sxeNode($node);
                        $range = $liftRangeDecoder->readRange($rangeNode);
                        error_log("Range id '$rangeId' was not found in referenced .lift-ranges file");
                        // TODO: Record an error for later reporting, instead of just error_log()ging it
                    }
                } else {
                    // Haven't parsed the .lift-ranges file yet. We'll assume it is alongside the .lift file.
                    $rangePath = $liftFileDir . "/" . $rangeFilename;
                    $sxeNode = simplexml_load_file($rangePath);
                    $parsedRanges = $liftRangeDecoder->decode($sxeNode);
                    $liftRanges = array_merge($liftRanges, $parsedRanges);
                    if (isset($liftRanges[$rangeId])) {
                        $range = $liftRanges[$rangeId];
                    } else {
                        // Range was NOT found in referenced .lift-ranges file after parsing it
//                         $dom = new \DomDocument();
//                         $n = $dom->importNode($node, true);
//                         $rangeNode = simplexml_import_dom($n);
                        $rangeNode = LiftImport::domNode_to_sxeNode($node);
                        $range = $liftRangeDecoder->readRange($rangeNode);
                        error_log("Range id '$rangeId' was not found in referenced .lift-ranges file");
                        // TODO: Record an error for later reporting, instead of just error_log()ging it
                    }
                }
                if ($node->hasChildNodes()) {
                    // Range elements defined in LIFT file override any values defined in .lift-ranges file.
//                     $dom = new \DomDocument();
//                     $n = $dom->importNode($node, true);
//                     $sxeNode = simplexml_import_dom($n);
                    $sxeNode = LiftImport::domNode_to_sxeNode($node);
                    $range = $liftRangeDecoder->readRange($sxeNode, $range);
                    $liftRanges[$rangeId] = $range;
                }
            }
            if ($reader->nodeType == \XMLReader::ELEMENT && $reader->localName == 'entry') {   // Reads the LIFT file and searches for the entry node
                $node = $reader->expand();
                $dom = new \DomDocument();
                $n = $dom->importNode($node, true); // expands the node for that particular guid
                $sxeNode = simplexml_import_dom($n);

                $guid = $reader->getAttribute('guid');
                $existingEntry = $entryList->searchEntriesFor('guid', $guid);
                if ($existingEntry) {
                    $entry = new LexEntryModel($projectModel, $existingEntry['id']);
                    $dateModified = $reader->getAttribute('dateModified');
                    if (self::differentModTime($dateModified, $entry->authorInfo->modifiedDate) || ! $skipSameModTime) {
                        if ($mergeRule == LiftMergeRule::CREATE_DUPLICATES) {
                            $entry = new LexEntryModel($projectModel);
                            $liftDecoder->readEntry($sxeNode, $entry, $mergeRule);
                            $entry->guid = '';
                            $entry->write();
                        } else {
                            if (isset($sxeNode->{'lexical-unit'})) {
                                $liftDecoder->readEntry($sxeNode, $entry, $mergeRule);
                                $entry->write();
                            } elseif (isset($sxeNode->attributes()->dateDeleted) && $deleteMatchingEntry) {
                                LexEntryModel::remove($projectModel, $existingEntry['id']);
                            }
                        }
                    } else {
                        // skip because same mod time and skip enabled
                        if (! isset($sxeNode->{'lexical-unit'}) && isset($sxeNode->attributes()->dateDeleted) && $deleteMatchingEntry) {
                            LexEntryModel::remove($projectModel, $existingEntry['id']);
                        }
                    }
                    self::addPartOfSpeechValuesToList($partOfSpeechValues, $entry);
                } else {
                    if (isset($sxeNode->{'lexical-unit'})) {
                        $entry = new LexEntryModel($projectModel);
                        $liftDecoder->readEntry($sxeNode, $entry, $mergeRule);
                        $entry->write();
                        self::addPartOfSpeechValuesToList($partOfSpeechValues, $entry);
                    }
                }
            }
        }

        $reader->close();

        if ($initialImport) {
            // replace part of speech option list with values from imported data
            // todo: remove this functionality when we have a way to import lift ranges (option lists) - cjh 2014-08
            if (array_key_exists('grammatical-info', $liftRanges)) {
                LiftImport::rangeToOptionList($projectModel, 'partOfSpeech', $liftRanges['grammatical-info']);
            }
            /*
            if (count($partOfSpeechValues) > 0) {
                $partOfSpeechOptionList = new LexOptionListModel($projectModel);
                $partOfSpeechOptionList->readByProperty('code', 'partOfSpeech');

                // start with an empty list
                $partOfSpeechOptionList->items->exchangeArray(array());

                foreach ($partOfSpeechValues as $value) {
                    $partOfSpeechOptionList->items->append(new LexiconOptionListItem($value));
                }
                $partOfSpeechOptionList->write();
            }
            */
            if (array_key_exists('anthro-code', $liftRanges)) {
                LiftImport::rangeToOptionList($projectModel, 'anthropologyCategories', $liftRanges['anthro-code']);
            }
            if (array_key_exists('domain-type', $liftRanges)) {
                LiftImport::rangeToOptionList($projectModel, 'academicDomains', $liftRanges['domain-type']);
            }
            if (array_key_exists('semantic-domain-ddp4', $liftRanges)) {
                LiftImport::rangeToOptionList($projectModel, 'semanticDomain', $liftRanges['semantic-domain-ddp4']);
            }
            if (array_key_exists('status', $liftRanges)) {
                LiftImport::rangeToOptionList($projectModel, 'status', $liftRanges['status']);
            }
        }
    }

    /**
     * Convert a LIFT range to an option list of the right code
     * Usage example: rangeToOptionList($projectModel, 'partOfSpeech', $liftRanges['grammatical-info'])
     * @param unknown $projectModel
     * @param unknown $optionListCode
     * @param unknown $liftRange
     * @param string $interfaceLang
     */
    public static function rangeToOptionList($projectModel, $optionListCode, $liftRange, $interfaceLang = 'en')
    {
        $partOfSpeechOptionList = new LexOptionListModel($projectModel);
        $partOfSpeechOptionList->readByProperty('code', $optionListCode);

        // start with an empty list
        $partOfSpeechOptionList->items->exchangeArray(array());

        foreach ($liftRange->rangeElements as $id => $elem) {
            $label = $elem->label[$interfaceLang]->value;
            if (isset($elem->abbrev)) {
                $abbrev = $elem->abbrev[$interfaceLang]->value;
            } else {
                $abbrev = null;
            }
            $partOfSpeechOptionList->items->append(new LexiconOptionListItem($label, $abbrev));
        }
        $partOfSpeechOptionList->write();
    }

    /**
     * @param string $zipFilePath
     * @param LexiconProjectModel $projectModel
     * @throws \Exception
     */
    public static function importZip($zipFilePath, $projectModel)
    {
        $assetDir = $projectModel->getAssetsPath();
        $extractDest = $assetDir . '/initialUpload_' . mt_rand();
        $retCode = LiftImport::extractZip($zipFilePath, $extractDest);
        if ($retCode) {
            throw new \Exception("Error extracting uploaded file");
            // TODO: Capture output from extractarchive.sh if retcode != 0
        }

        $report = new ZipImportErrorReport(ZipImportErrorReport::FILE, basename($zipFilePath));

        // Now find the .lift file in the uploaded zip
        $dirIter = new \RecursiveDirectoryIterator($extractDest);
        $iterIter = new \RecursiveIteratorIterator($dirIter);
        $liftIter = new \RegexIterator($iterIter, '/\.lift$/', \RegexIterator::MATCH);
        $liftFilenames = array();
        foreach ($liftIter as $file) {
            $liftFilenames[] = $file->getPathname();
        }
        if (empty($liftFilenames)) {
            throw new \Exception("Uploaded file does not contain any LIFT data");
        }
        if (count($liftFilenames) > 1) {
            foreach (array_slice($liftFilenames, 1) as $fileName) {
                $report->addUnhandledLiftFile($fileName);
            }
        }

        // Import first .lift file (only).
        $liftFilePath = $liftFilenames[0];
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;
        $deleteMatchingEntry = true;
        LiftImport::merge($liftFilePath, $projectModel, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
        if ($report->hasError()) {
            error_log($report->toString() . "\n");
            return $report->toString();
        } else {
            return '';
        }
    }

    /**
     * @param string $zipFilePath
     * @param string $destDir
     * @throws \Exception
     */
    public static function extractZip($zipFilePath, $destDir) {
        // extractarchive.sh script needs absolute path for archive file
        $realpathResult = realpath($zipFilePath);
        if ($realpathResult) {
            $zipFilePath = $realpathResult;
        } else {
            throw new \Exception("Error receiving uploaded file");
        }

        // Ensure zip file doesn't expand into too much data
        // TODO: Implement this if needed. For now, comment out and don't check max size. 2014-10 RM
//         $output = array();
//         $retcode = 0;
//         $size = (int)exec("scripts/getarchivesize.sh " . escapeshellarg($zipFilePath), $output, $retcode);
//         if ($retcode) {
//             throw new \Exception("Uploaded file appears to be invalid");
//         }
//         $maxSize = 100*1024*1024; // TODO: Get this from a config somewhere. (E.g., config/server.php)
//         if ($size > $maxSize) {
//             throw new \Exception("Uploaded file is too large");
//         }

        // We're fine, extract the zip file
        $output = array();
        $retcode = 0;
        exec("scripts/extractarchive.sh " . escapeshellarg($zipFilePath) . " " . escapeshellarg($destDir), $output, $retcode);
        return $retcode;
    }

    /**
     * validate the lift data
     * @param string $xml
     * @throws \Exception
     * @return boolean
     */
    public static function validate($xml)
    {
        $reader = new \XMLReader();
        $reader->XML($xml);

        // validate LIFT
        set_error_handler(function ($errno, $errstr, $errfile, $errline, array $errcontext) {
            // error was suppressed with the @-operator
            if (0 === error_reporting()) {
                return false;
            }

            $validationErrorIndex = strpos($errstr, 'XMLReader::next(): ');
            if ($validationErrorIndex !== false) {
                $errMsg = substr($errstr, $validationErrorIndex + 19);
                throw new \Exception("Sorry, the selected LIFT file is invalid: $errMsg");
            } else {
                return true;    // use the default handler
            }
        });
        $reader->setRelaxNGSchema(APPPATH . "vendor/lift/lift-0.13.rng");
        while ($reader->next()) {}    // read the entire file to validate all
        restore_error_handler();

        return true;
    }

    /**
     * @param string $importDateModified
     * @param DateTime $entryDateModified
     * @return boolean
     */
    private static function differentModTime($importDateModified, $entryDateModified)
    {
        $dateModified = new \DateTime($importDateModified);

        return ($dateModified->getTimestamp() != $entryDateModified->getTimestamp());
    }

    /**
     * @param $arr array - list to append to
     * @param $entryModel LexEntryModel
     */
    private static function addPartOfSpeechValuesToList(&$arr, $entryModel)
    {
        foreach ($entryModel->senses as $sense) {
            $pos = $sense->partOfSpeech->value;
            if (!in_array($pos, $arr)) {
                array_push($arr, $pos);
            }
        }
    }
}
