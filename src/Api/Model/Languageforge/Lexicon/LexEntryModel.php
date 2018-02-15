<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use LazyProperty\LazyPropertiesTrait;
use Palaso\Utilities\CodeGuard;

function generateSense()
{
    return new LexSense();
}

function generateCustomField($data)
{
    CodeGuard::checkTypeAndThrow($data, 'array');
    if (array_key_exists('type', $data)) {
        switch ($data['type']) {
            case LexConfig::MULTIPARAGRAPH:
                return new LexMultiParagraph();
            default:
                $type = $data['type'];
                throw new \Exception("Cannot generate unknown custom field type: $type");
        }
    } elseif (array_key_exists('value', $data)) {
        return new LexValue();
    } elseif (array_key_exists('values', $data)) {
        return new LexMultiValue();
    } elseif (array_key_exists('paragraphs', $data)) {
        return new LexMultiParagraph();
    } else {
        return new LexMultiText();
    }
}

class LexEntryModel extends MapperModel
{
    use LazyPropertiesTrait;

    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->setPrivateProp('guid');
        $this->setPrivateProp('dirtySR');
        $this->setPrivateProp('mercurialSha');
        $this->setReadOnlyProp('authorInfo');

        $this->initLazyProperties([
            'lexeme',
            'senses',
            'authorInfo',
            'citationForm',
            'customFields',
            'entryBibliography',
            'entryRestrictions',
            'environments',
            'etymology',
            'etymologyGloss',
            'etymologyComment',
            'etymologySource',
            'literalMeaning',
            'location',
            'morphologyType',
            'note',
            'pronunciation',
            'cvPattern',
            'tone',
            'summaryDefinition'
        ], false);

        $this->isDeleted = false;
        $this->id = new Id();

        $databaseName = $projectModel->databaseName();
        parent::__construct(self::mapper($databaseName), $id);
    }

    /** @var boolean */
    public $isDeleted;

    /** @var IdReference */
    public $id;

    /** @var string */
    public $guid;

    /** @var int */
    public $dirtySR;

    // PUBLIC PROPERTIES

    /** @var LexMultiText */
    public $lexeme;

    /** @var ArrayOf<LexSense> */
    public $senses;

    // REMAINING PUBLIC PROPERTIES IN ALPHABETIC ORDER

    /** @var LexAuthorInfo */
    public $authorInfo;

    /** @var LexMultiText */
    public $citationForm;

    /** @var MapOf<LexMultiText|LexMultiParagraph|LexValue|LexMultiValue> */
    public $customFields;

    /** @var LexMultiText */
    public $entryBibliography;

    /** @var LexMultiText */
    public $entryRestrictions;

    /** @var LexMultiValue */
    public $environments;

    /** @var LexMultiText */
    public $etymology;

    /** @var LexMultiText */
    public $etymologyGloss;

    /** @var LexMultiText */
    public $etymologyComment;

    /** @var LexMultiText */
    public $etymologySource;

    /** @var LexMultiText */
    public $literalMeaning;

    /** @var LexValue */
    public $location;

    /** @var string */
    public $mercurialSha;

    /** @var string */
    public $morphologyType;

    /** @var LexMultiText */
    public $note;

    /** @var LexMultiText */
    public $pronunciation;

    /**
     * cvPattern is part of pronunciation, but is under LexEntry in the LanguageForge model. REVIEW CP 2014-10
     * @var LexMultiText
     */
    public $cvPattern;

    /**
     * tone is part of pronunciation, but is under LexEntry in the LanguageForge model. REVIEW CP 2014-10
     * @var LexMultiText
     */
    public $tone;

    /** @var LexMultiText */
    public $summaryDefinition;

    public static function mapper($databaseName)
    {
        /** @var LexEntryMongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new LexEntryMongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }

    protected function getPropertyType($name)
    {
        switch ($name) {
            case 'senses':
                return "ArrayOf(LexSense)";
            case 'customFields':
                return "MapOf(CustomField)";
            case 'authorInfo':
                return "LexAuthorInfo";

            case 'lexeme':
            case 'citationForm':
            case 'entryBibliography':
            case 'entryRestrictions':
            case 'pronunciation':
            case 'cvPattern':
            case 'tone':
            case 'etymology':
            case 'etymologyGloss':
            case 'etymologyComment':
            case 'etymologySource':
            case 'literalMeaning':
            case 'note':  // TODO Notes need to be an array, and more capable than a multi-text. Notes have types. CP 2014-10
            case 'summaryDefinition':
                return "LexMultiText";
            case 'environments':
                return "LexMultiValue";
            case 'location':
                return "LexValue";
            case 'morphologyType':
            default:
                return "string";
        }
    }

    protected function createProperty($name)
    {
        switch ($this->getPropertyType($name)) {
            case 'ArrayOf(LexSense)': return new ArrayOf('Api\Model\Languageforge\Lexicon\generateSense');
            case 'MapOf(CustomField)': return new MapOf('Api\Model\Languageforge\Lexicon\generateCustomField');
            case 'LexAuthorInfo': return new LexAuthorInfo();
            case 'LexMultiText': return new LexMultiText();
            case 'LexMultiValue': return new LexMultiValue();
            case 'LexValue': return new LexValue();

            case 'string':
            default:
                return '';
        }
    }

    protected function convertLexMultiTextDifferences(array $differences, string $propertyName)
    {
        // The LexMultiText->differences() function returns differences as an array looking like:
        // [ ["inputSystem" => $key, "this" => $thisValue, "other" => $otherValue], ... ]
        $result = [];
        foreach ($differences as $difference) {
            $inputSystem = $difference["inputSystem"];
            $result["oldValue." . $propertyName . "." . $inputSystem] = $difference["this"];
            $result["newValue." . $propertyName . "." . $inputSystem] = $difference["other"];
        }
        return $result;
    }

    protected function convertDifferences(array $difference, string $propertyName)
    {
        if (empty($difference)) {
            return [];
        }
        return [ "oldValue." . $propertyName => $difference["this"],
                 "newValue." . $propertyName => $difference["other"] ];
    }

    protected function getSenseDifferences($thisSenses, $otherSenses)
    {
        $differences = [];

        $thisGuids = [];
        $thisSensesByGuid = [];
        foreach ($thisSenses as $sense) {
            /** @var LexSense $sense */
            $thisGuids[] = $sense->guid;
            $thisSensesByGuid[$sense->guid] = $sense;
        }
        $otherGuids = [];
        $otherSensesByGuid = [];
        foreach ($otherSenses as $sense) {
            /** @var LexSense $sense */
            $otherGuids[] = $sense->guid;
            $otherSensesByGuid[$sense->guid] = $sense;
        }

        $seenGuids = [];
        $thisPositions = array_flip($thisGuids);
        $otherPositions = array_flip($otherGuids);
        foreach ($thisSensesByGuid as $guid => $thisSense) {
            /** @var LexSense $thisSense */
            $seenGuids[] = $guid;
            $thisPosition  = $thisPositions[$guid];
            $otherPosition = $otherPositions[$guid];
            if ($otherPosition !== $thisPosition) {
                $differences["movedFrom.senses#" . $guid] = $thisPosition;
                $differences["movedTo.senses#" . $guid] = $otherPosition;
            }
            if (array_key_exists($guid, $otherSensesByGuid)) {
                /** @var LexSense $otherSense */
                $otherSense = $otherSensesByGuid[$guid];
                $senseDifferences = $thisSense->differences($otherSense);
                foreach ($senseDifferences as $key => $senseDifference) {
                    if (substr($key, 0, 5) === "this.") {
                        $newKey = str_replace("this.",  "oldValue.senses#" . $guid . ".", $key);
                    } elseif (substr($key, 0, 6) === "other.") {
                        $newKey = str_replace("other.", "newValue.senses#" . $guid . ".", $key);
                    } else {
                        $newKey = $key;
                    }
                    $differences[$newKey] = $senseDifference;
                }
            } else {
                $differences["deleted.senses#" . $guid] = $thisSense->nameForActivityLog();
            }
        }
        $addedGuids = array_diff($otherGuids, $seenGuids);
        foreach ($addedGuids as $guid) {
            /** @var LexSense $otherSense */
            $otherSense = $otherSensesByGuid[$guid];
            $differences["added.senses#" . $guid] = $otherSense->nameForActivityLog();
        }

        return $differences;
    }

    public function getPropertyDifference(LexEntryModel $otherModel, string $propertyName)
    {
        $type = $this->getPropertyType($propertyName);
        switch ($type) {
            case "LexMultiText":
                /** @var LexMultiText $multiText */
                $multiText = $this->$propertyName;
                $difference = $multiText->differences($otherModel->$propertyName);
                return $this->convertLexMultiTextDifferences($difference, $propertyName);
            case "LexMultiValue":
                /** @var LexMultiValue $multiValue */
                $multiValue = $this->$propertyName;
                $difference = $multiValue->differences($otherModel->$propertyName);
                return $this->convertDifferences($difference, $propertyName);
            case "LexMultiParagraph":
                /** @var LexMultiParagraph $multiParagraph */
                $multiParagraph = $this->$propertyName;
                $difference = $multiParagraph->differences($otherModel->$propertyName);
                return $this->convertDifferences($difference, $propertyName);
            case "LexValue":
                $thisValue  = (string)$this->$propertyName;
                $otherValue = (string)$otherModel->$propertyName;

                if ($thisValue === $otherValue) {
                    return [];
                } else {
                    return ["oldValue." . $propertyName => $thisValue, "newValue." . $propertyName => $otherValue];
                }
            case "string":
                $thisValue  = $this->$propertyName;
                $otherValue = $otherModel->$propertyName;
                if ($thisValue === $otherValue) {
                    return [];
                } else {
                    return ["oldValue." . $propertyName => $thisValue, "newValue." . $propertyName => $otherValue];
                }
            case 'ArrayOf(LexSense)':
                $thisSenses  = $this->$propertyName;
                $otherSenses = $otherModel->$propertyName;
                $result = $this->getSenseDifferences($thisSenses, $otherSenses);
                return $result;
            case 'MapOf(CustomField)':
                // TODO: Implement this. Will probably have to refactor this function a bit to handle that one level of nesting
                return [];
            case 'LexAuthorInfo':
                // We don't put authorInfo changes in the activity log
                return [];
            default:
                return [];
        }
    }

    public function calculateDifferences($otherModel)
    {
        // Perhaps this could be made generic enough to move to the MapperModel base class
        $properties = [
            'lexeme',
            'senses',
            'authorInfo',
            'citationForm',
            'customFields',
            'entryBibliography',
            'entryRestrictions',
            'environments',
            'etymology',
            'etymologyGloss',
            'etymologyComment',
            'etymologySource',
            'literalMeaning',
            'location',
            'morphologyType',
            'note',
            'pronunciation',
            'cvPattern',
            'tone',
            'summaryDefinition'
        ];
        $result = [];
        foreach ($properties as $property)
        {
            foreach ($this->getPropertyDifference($otherModel, $property) as $key => $difference) {
                $result[$key] = $difference;
            }
        }
        return $result;
    }

    public function hasSenses()
    {
        return isset($this->senses);
    }

    /**
     * If the $value of $propertyName exists in senses return the index
     *
     * @param string $propertyName
     * @param string $value
     * @return number $index or -1 if not found
     */
    public function searchSensesFor($propertyName, $value)
    {
        foreach ($this->senses as $index => $sense) {
            if (isset($sense->{$propertyName}) && (trim($sense->{$propertyName}) !== '') && ($sense->{$propertyName} == $value)) {
                return $index;
            }
        }
        return -1;
    }

    /**
     * Remove this LexEntry from the collection
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public static function remove($projectModel, $id)
    {
        $databaseName = $projectModel->databaseName();
        self::mapper($databaseName)->remove($id);
    }
}

class LexEntryMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [
        ['key' => ['guid' => 1], 'unique' => true],
        ['key' => ['guid' => 1, 'dirtySR' => 1], 'unique' => true]
    ];
}
