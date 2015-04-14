<?php
namespace models\languageforge\lexicon;

use models\languageforge\lexicon\config\LexConfiguration;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\ProjectModel;

class LexEntryListModel extends \models\mapper\MapperListModel
{
    /**
     *
     * @var LexConfiguration
     */
    private $_config;

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }

    /**
     *
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     * @param int $limit
     * @param int $skip
     */
    public function __construct($projectModel, $newerThanTimestamp = null, $limit = 0, $skip = 0)
    {
        $lexProject = new LexiconProjectModel($projectModel->id->asString());
        $this->_config = $lexProject->config;

        if (!is_null($newerThanTimestamp)) {
            $startDate = new \MongoDate($newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate), 'isDeleted' => false), array(), array(), $limit, $skip);
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => false), array(), array(), $limit, $skip);
        }
    }

    public function readForDto($missingInfo = '')
    {
        // TODO This can be refactored to perform missing info based on the data type, rather than the property name. There is much repetition in the code below CP 2014-08
        parent::read();
        $entriesToReturn = array();

        if ($missingInfo != '') {
            foreach ($this->entries as $entry) {
                $foundMissingInfo = false;
                if (!array_key_exists('senses', $entry) || count($entry['senses']) == 0) {
                    $foundMissingInfo = true;
                } else {
                    foreach ($entry['senses'] as $sense) {
                        switch ($missingInfo) {
                            case LexiconConfigObj::DEFINITION:
                                if (!array_key_exists('definition', $sense) || count($sense['definition']) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense['definition'] as $form) {
                                        if ($form['value'] == '') {
                                            $foundMissingInfo = true;
                                        }
                                    }
                                }
                                break;

                            case LexiconConfigObj::POS:
                                if (!array_key_exists('partOfSpeech', $sense) || !array_key_exists('value', $sense['partOfSpeech']) || $sense['partOfSpeech']['value'] == '') {
                                    $foundMissingInfo = true;
                                }
                                break;

                            case LexiconConfigObj::EXAMPLE_SENTENCE:
                                if (!array_key_exists('examples', $sense) || count($sense['examples']) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense['examples'] as $example) {
                                        if (!array_key_exists('sentence', $example) || count($example['sentence']) == 0) {
                                            $foundMissingInfo = true;
                                        } else {
                                            foreach ($example['sentence'] as $form) {
                                                if ($form['value'] == '') {
                                                    $foundMissingInfo = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                break;

                            case LexiconConfigObj::EXAMPLE_TRANSLATION:
                                if (!array_key_exists('examples', $sense) || count($sense['examples']) == 0) {
                                    $foundMissingInfo = true;
                                } else {
                                    foreach ($sense['examples'] as $example) {
                                        if (!array_key_exists('translation', $example) || count($example['translation']) == 0) {
                                            $foundMissingInfo = true;
                                        } else {
                                            foreach ($example['translation'] as $form) {
                                                if ($form['value'] == '') {
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
     * @param unknown $value
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
