<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use MongoDB\BSON\UTCDateTime;

class LexEntryListModel extends MapperListModel
{
    /**
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     * @param int $limit
     * @param int $skip
     */
    public function __construct($projectModel, $newerThanTimestamp = null, $limit = 0, $skip = 0)
    {
        // for use with readAsModels()
        $this->entries = new ArrayOf(function () use ($projectModel) {
            return new LexEntryModel($projectModel);
        });

        $lexProject = new LexProjectModel($projectModel->id->asString());
        $this->_config = $lexProject->config;

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000 * $newerThanTimestamp);
            parent::__construct(
                self::mapper($projectModel->databaseName()),
                ["dateModified" => ['$gte' => $startDate], "isDeleted" => false],
                [],
                [],
                $limit,
                $skip
            );
        } else {
            parent::__construct(
                self::mapper($projectModel->databaseName()),
                ["isDeleted" => false],
                [],
                [],
                $limit,
                $skip
            );
        }
    }

    /** @var LexConfiguration */
    private $_config;

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, "lexicon");
        }

        return $instance;
    }

    public function readForDto($missingInfo = "")
    {
        // TODO This can be refactored to perform missing info based on the data type, rather than the property name. There is much repetition in the code below CP 2014-08
        parent::read();
        $entriesToReturn = [];

        if ($missingInfo != "") {
            foreach ($this->entries as $entry) {
                $foundMissingInfo = false;
                if (!array_key_exists("senses", $entry) || count($entry["senses"]) == 0) {
                    $foundMissingInfo = true;
                } else {
                    foreach ($entry["senses"] as $sense) {
                        switch ($missingInfo) {
                            case LexConfig::DEFINITION:
                                if (!array_key_exists("definition", $sense) || count($sense["definition"]) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense["definition"] as $form) {
                                        if ($form["value"] == "") {
                                            $foundMissingInfo = true;
                                        }
                                    }
                                }
                                break;

                            case LexConfig::POS:
                                if (
                                    !array_key_exists("partOfSpeech", $sense) ||
                                    !array_key_exists("value", $sense["partOfSpeech"]) ||
                                    $sense["partOfSpeech"]["value"] == ""
                                ) {
                                    $foundMissingInfo = true;
                                }
                                break;

                            case LexConfig::EXAMPLE_SENTENCE:
                                if (!array_key_exists("examples", $sense) || count($sense["examples"]) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense["examples"] as $example) {
                                        if (
                                            !array_key_exists("sentence", $example) ||
                                            count($example["sentence"]) == 0
                                        ) {
                                            $foundMissingInfo = true;
                                        } else {
                                            foreach ($example["sentence"] as $form) {
                                                if ($form["value"] == "") {
                                                    $foundMissingInfo = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                break;

                            case LexConfig::EXAMPLE_TRANSLATION:
                                if (!array_key_exists("examples", $sense) || count($sense["examples"]) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense["examples"] as $example) {
                                        if (
                                            !array_key_exists("translation", $example) ||
                                            count($example["translation"]) == 0
                                        ) {
                                            $foundMissingInfo = true;
                                        } else {
                                            foreach ($example["translation"] as $form) {
                                                if ($form["value"] == "") {
                                                    $foundMissingInfo = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                break;

                            default:
                                throw new \Exception("Unknown missingInfoType = " . $missingInfo);
                        }
                        if ($foundMissingInfo) {
                            break;
                        }
                    }
                }
                if ($foundMissingInfo) {
                    $entriesToReturn[] = $entry;
                }
            } // end of foreach
            $this->entries = $entriesToReturn;
            $this->count = count($this->entries);
        }
    }

    /**
     * If the $value of $propertyName exists in entries return the entry
     * @param string $propertyName
     * @param mixed $value
     * @return array|boolean $entry or false if not found
     */
    public function searchEntriesFor($propertyName, $value)
    {
        foreach ($this->entries as $entry) {
            if ($entry[$propertyName] == $value) {
                return $entry;
            }
        }

        return false;
    }
}
