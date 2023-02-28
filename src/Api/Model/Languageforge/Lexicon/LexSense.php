<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

function generateExample()
{
    return new LexExample();
}

function generatePicture()
{
    return new LexPicture();
}

class LexSense extends ObjectForEncoding
{
    use LazyPropertiesTrait;

    public function __construct($liftId = "", $guid = "")
    {
        $this->setReadOnlyProp("authorInfo");
        $this->setRearrangeableProp("examples");
        $this->setRearrangeableProp("pictures");
        if ($liftId) {
            $this->liftId = $liftId;
        }
        $this->guid = Guid::makeValid($guid);

        $this->initLazyProperties(
            [
                "partOfSpeech",
                "semanticDomain",
                "examples",
                "customFields",
                "authorInfo",
                "definition",
                "gloss",
                "pictures",
                "scientificName",
                "anthropologyNote",
                "senseBibliography",
                "discourseNote",
                "encyclopedicNote",
                "generalNote",
                "grammarNote",
                "phonologyNote",
                "senseRestrictions",
                "semanticsNote",
                "sociolinguisticsNote",
                "source",
                "senseImportResidue",
                "usages",
                "reversalEntries",
                "senseType",
                "academicDomains",
                "anthropologyCategories",
                "status",
            ],
            false
        );
    }

    protected function getPropertyType(string $name)
    {
        switch ($name) {
            case "partOfSpeech":
                return "LexValue";
            case "semanticDomain":
                return "LexMultiValue";
            case "examples":
                return "ArrayOf(LexExample)";
            case "customFields":
                return "MapOf(CustomField)";
            case "authorInfo":
                return "LexAuthorInfo";
            case "pictures":
                return "ArrayOf(LexPicture)";

            case "definition":
            case "gloss":
            case "scientificName":
            case "anthropologyNote":
            case "senseBibliography":
            case "discourseNote":
            case "encyclopedicNote":
            case "generalNote":
            case "grammarNote":
            case "phonologyNote":
            case "senseRestrictions":
            case "semanticsNote":
            case "sociolinguisticsNote":
            case "source":
            case "senseImportResidue":
                return "LexMultiText";

            case "usages":
                return "LexMultiValue";

            // TODO reversalEntries needs to be a Taglist 07-2014 DDW
            case "reversalEntries":
                return "LexMultiValue";
            case "senseType":
                return "LexValue";
            case "academicDomains":
                return "LexMultiValue";
            case "anthropologyCategories":
                return "LexMultiValue";
            case "status":
                return "LexValue";
            default:
                return "string";
        }
    }

    protected function createProperty($name)
    {
        switch ($this->getPropertyType($name)) {
            case "LexValue":
                return new LexValue();
            case "LexMultiValue":
                return new LexMultiValue();
            case "ArrayOf(LexExample)":
                return new ArrayOf("Api\Model\Languageforge\Lexicon\generateExample");
            case "MapOf(CustomField)":
                return new MapOf("Api\Model\Languageforge\Lexicon\generateCustomField");
            case "LexAuthorInfo":
                return new LexAuthorInfo();
            case "ArrayOf(LexPicture)":
                return new ArrayOf("Api\Model\Languageforge\Lexicon\generatePicture");
            case "LexMultiText":
                return new LexMultiText();

            case "string":
            default:
                return "";
        }
    }

    /**
     * The id of the sense as specified in the LIFT file
     * @var string
     */
    public $liftId;

    /** @var string */
    public $guid;

    /** @var LexMultiText */
    public $definition;

    /** @var LexMultiText */
    public $gloss;

    /** @var ArrayOf<LexPicture> */
    public $pictures;

    /** @var LexValue */
    public $partOfSpeech;

    /** @var LexMultiValue */
    public $semanticDomain;

    /** @var ArrayOf<LexExample> */
    public $examples;

    /** @var MapOf<LexMultiText|LexMultiParagraph|LexValue|LexMultiValue> */
    public $customFields;

    /** @var LexAuthorInfo */
    public $authorInfo;

    /**
     * If the $value of $propertyName exists in pictures return the index
     *
     * @param string $propertyName
     * @param string $value
     * @return number $index or -1 if not found
     */
    public function searchPicturesFor($propertyName, $value)
    {
        foreach ($this->pictures as $index => $picture) {
            if (
                isset($picture->{$propertyName}) &&
                trim($picture->{$propertyName}) !== "" &&
                $picture->{$propertyName} == $value
            ) {
                return $index;
            }
        }
        return -1;
    }

    /**
     * If the $value of $propertyName exists in examples return the index
     *
     * @param string $propertyName
     * @param string $value
     * @return number $index or -1 if not found
     */
    public function searchExamplesFor($propertyName, $value)
    {
        foreach ($this->examples as $index => $example) {
            if (
                isset($example->{$propertyName}) &&
                trim($example->{$propertyName}) !== "" &&
                $example->{$propertyName} == $value
            ) {
                return $index;
            }
        }
        return -1;
    }

    /**
     * If the $text of $tag of $propertyName exists in examples return the index
     *
     * @param string $propertyName
     * @param string $tag
     * @param string $text
     * @return number $index or -1 if not found
     */
    public function searchExamplesMultiTextFor($propertyName, $tag, $text)
    {
        foreach ($this->examples as $index => $example) {
            if (
                isset($example->{$propertyName}) &&
                $example->{$propertyName}->offsetExists($tag) &&
                trim($example->{$propertyName}[$tag]) !== "" &&
                $example->{$propertyName}[$tag] == $text
            ) {
                return $index;
            }
        }
        return -1;
    }

    public function nameForActivityLog($preferredInputSystem = null)
    {
        if (isset($this->definition)) {
            if (isset($preferredInputSystem) && $this->definition->hasForm($preferredInputSystem)) {
                return $this->definition[$preferredInputSystem];
            } elseif ($this->definition->count() > 0) {
                foreach ($this->definition as $inputSystem => $content) {
                    return (string) $content;
                }
            }
        }
        if (isset($this->gloss)) {
            if (isset($preferredInputSystem) && $this->gloss->hasForm($preferredInputSystem)) {
                return $this->gloss[$preferredInputSystem];
            } elseif ($this->gloss->count() > 0) {
                foreach ($this->gloss as $inputSystem => $content) {
                    return (string) $content;
                }
            }
        }
        return "";
    }

    protected function convertLexMultiTextDifferences(array $differences, string $propertyName)
    {
        // The LexMultiText->differences() function returns differences as an array looking like:
        // [ ["inputSystem" => $key, "this" => $thisValue, "other" => $otherValue], ... ]
        $result = [];
        foreach ($differences as $difference) {
            $inputSystem = $difference["inputSystem"];
            $result["this." . $propertyName . "." . $inputSystem] = $difference["this"];
            $result["other." . $propertyName . "." . $inputSystem] = $difference["other"];
        }
        return $result;
    }

    protected function convertDifferences(array $difference, string $propertyName)
    {
        if (empty($difference)) {
            return [];
        }
        return ["this." . $propertyName => $difference["this"], "other." . $propertyName => $difference["other"]];
    }

    public function getPropertyDifference(
        LexSense $otherSense,
        string $propertyName,
        string $thisSenseId,
        string $otherSenseId
    ) {
        $type = $this->getPropertyType($propertyName);
        switch ($type) {
            case "LexMultiText":
                /** @var LexMultiText $multiText */
                $multiText = $this->$propertyName;
                $difference = $multiText->differences($otherSense->$propertyName);
                return $this->convertLexMultiTextDifferences($difference, $propertyName);
            case "LexMultiValue":
                /** @var LexMultiValue $multiValue */
                $multiValue = $this->$propertyName;
                $difference = $multiValue->differences($otherSense->$propertyName);
                return $this->convertDifferences($difference, $propertyName);
            case "LexMultiParagraph":
                /** @var LexMultiParagraph $multiParagraph */
                $multiParagraph = $this->$propertyName;
                $difference = $multiParagraph->differences($otherSense->$propertyName);
                return $this->convertDifferences($difference, $propertyName);
            case "LexValue":
                $thisValue =
                    is_null($this->$propertyName) || is_null($this->$propertyName->value)
                        ? ""
                        : (string) $this->$propertyName;
                $otherValue =
                    is_null($otherSense->$propertyName) || is_null($otherSense->$propertyName->value)
                        ? ""
                        : (string) $otherSense->$propertyName;

                if ($thisValue === $otherValue) {
                    return [];
                } else {
                    return ["this." . $propertyName => $thisValue, "other." . $propertyName => $otherValue];
                }
            case "string":
                $thisValue = $this->$propertyName;
                $otherValue = $otherSense->$propertyName;
                if ($thisValue === $otherValue) {
                    return [];
                } else {
                    return ["this." . $propertyName => $thisValue, "other." . $propertyName => $otherValue];
                }
            case "ArrayOf(LexExample)":
                $thisExamples = $this->$propertyName;
                $otherExamples = $otherSense->$propertyName;
                return $this->getExampleDifferences($thisExamples, $otherExamples, $thisSenseId, $otherSenseId);
            case "MapOf(CustomField)":
                // TODO: Implement this. Will probably have to refactor this function a bit to handle that one level of nesting
                return [];
            case "ArrayOf(LexPicture)":
                // TODO: Check if filename or caption has changed and do something appropriate
                return [];
            case "LexAuthorInfo":
                // We don't put authorInfo changes in the activity log, and we'll skip pictures as well
                return [];
            default:
                return [];
        }
    }

    protected function getExampleDifferences($thisExamples, $otherExamples, $thisSenseId, $otherSenseId)
    {
        $differences = [];

        $thisGuids = [];
        $thisExamplesByGuid = [];
        foreach ($thisExamples as $example) {
            /** @var LexExample $example */
            $thisGuids[] = $example->guid;
            $thisExamplesByGuid[$example->guid] = $example;
        }
        $otherGuids = [];
        $otherExamplesByGuid = [];
        foreach ($otherExamples as $example) {
            /** @var LexExample $example */
            $otherGuids[] = $example->guid;
            $otherExamplesByGuid[$example->guid] = $example;
        }

        $seenGuids = [];
        $thisPositions = array_flip($thisGuids);
        $otherPositions = array_flip($otherGuids);
        foreach ($thisExamplesByGuid as $guid => $thisExample) {
            /** @var LexExample $thisExample */
            $seenGuids[] = $guid;
            $thisPosition = $thisPositions[$guid];
            $thisExampleId = "examples@" . $thisPosition . "#" . $guid;
            if (isset($otherPositions[$guid])) {
                $otherPosition = $otherPositions[$guid];
                if ($otherPosition !== $thisPosition) {
                    $differences["moved." . $thisSenseId . "." . $thisExampleId] = (string) $otherPosition;
                }
            } else {
                $otherPosition = $thisPosition;
            }
            if (array_key_exists($guid, $otherExamplesByGuid)) {
                /** @var LexExample $otherExample */
                $otherExample = $otherExamplesByGuid[$guid];
                $otherExampleId = "examples@" . $otherPosition . "#" . $guid;
                $this->addFieldDifferencesFromExample(
                    $thisExample,
                    $otherExample,
                    $thisExampleId,
                    $otherExampleId,
                    $differences
                );
            } else {
                $differences["deleted." . $thisSenseId . "." . $thisExampleId] = $thisExample->nameForActivityLog();
                $this->addFieldDifferencesFromExample(
                    $thisExample,
                    new LexExample(),
                    $thisExampleId,
                    $thisExampleId,
                    $differences
                );
            }
        }
        $addedGuids = array_diff($otherGuids, $seenGuids);
        foreach ($addedGuids as $guid) {
            /** @var LexExample $otherExample */
            $otherExample = $otherExamplesByGuid[$guid];
            $otherPosition = $otherPositions[$guid];
            $otherExampleId = "examples@" . $otherPosition . "#" . $guid;
            $differences["added." . $otherSenseId . "." . $otherExampleId] = $otherExample->nameForActivityLog();
            $this->addFieldDifferencesFromExample(
                new LexExample(),
                $otherExample,
                $otherExampleId,
                $otherExampleId,
                $differences
            );
        }

        return $differences;
    }

    protected function addFieldDifferencesFromExample(
        $thisExample,
        $otherExample,
        $thisExampleId,
        $otherExampleId,
        &$differences
    ) {
        $exampleDifferences = $thisExample->differences($otherExample, $thisExampleId, $otherExampleId);
        foreach ($exampleDifferences as $key => $exampleDifference) {
            if (StringUtil::startsWith($key, "this.")) {
                $newKey = "this." . $thisExampleId . "." . substr($key, strlen("this."));
            } elseif (StringUtil::startsWith($key, "other.")) {
                $newKey = "other." . $thisExampleId . "." . substr($key, strlen("other."));
            } else {
                $newKey = $key;
            }
            $differences[$newKey] = $exampleDifference;
        }
    }

    public function differences(LexSense $otherSense, string $thisSenseId, string $otherSenseId)
    {
        $properties = [
            "partOfSpeech",
            "semanticDomain",
            "examples",
            "customFields",
            "authorInfo",
            "definition",
            "gloss",
            "pictures",
            "scientificName",
            "anthropologyNote",
            "senseBibliography",
            "discourseNote",
            "encyclopedicNote",
            "generalNote",
            "grammarNote",
            "phonologyNote",
            "senseRestrictions",
            "semanticsNote",
            "sociolinguisticsNote",
            "source",
            "senseImportResidue",
            "usages",
            "reversalEntries",
            "senseType",
            "academicDomains",
            "anthropologyCategories",
            "status",
        ];
        $result = [];
        foreach ($properties as $property) {
            foreach (
                $this->getPropertyDifference($otherSense, $property, $thisSenseId, $otherSenseId)
                as $key => $difference
            ) {
                $result[$key] = $difference;
            }
        }
        return $result;
    }

    // less common fields used in FLEx

    /** @var LexMultiText */
    public $scientificName;

    /** @var LexMultiText */
    public $anthropologyNote;

    /** @var LexMultiText */
    public $senseBibliography;

    /** @var LexMultiText */
    public $discourseNote;

    /** @var LexMultiText */
    public $encyclopedicNote;

    /** @var LexMultiText */
    public $generalNote;

    /** @var LexMultiText */
    public $grammarNote;

    /** @var LexMultiText */
    public $phonologyNote;

    /** @var LexMultiText */
    public $senseRestrictions;

    /** @var LexMultiText */
    public $semanticsNote;

    /** @var LexMultiText */
    public $sociolinguisticsNote;

    /** @var LexMultiText */
    public $source;

    /** @var LexMultiValue */
    public $usages;

    // TODO 07-2014 DDW make this TagList
    /** @var LexMultiValue */
    public $reversalEntries;

    /** @var LexValue */
    public $senseType;

    /** @var LexMultiValue */
    public $academicDomains;

    /** @var LexMultiValue */
    public $anthropologyCategories;

    /** @var LexMultiText */
    public $senseImportResidue;

    /** @var LexValue */
    public $status;
}
