<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

class LexExample extends ObjectForEncoding
{
    use LazyPropertiesTrait;

    public function __construct($liftId = "", $guid = "")
    {
        $this->setReadOnlyProp("authorInfo");
        if ($liftId) {
            $this->liftId = $liftId;
        }
        $this->guid = Guid::makeValid($guid);

        $this->initLazyProperties(
            ["authorInfo", "sentence", "translation", "translationGuid", "reference", "customFields"],
            false
        );
    }

    protected function getPropertyType(string $name)
    {
        switch ($name) {
            case "authorInfo":
                return "LexAuthorInfo";
            case "sentence":
            case "translation":
            case "reference":
                return "LexMultiText";
            case "translationGuid":
                return "Guid";
            case "customFields":
                return "MapOf(CustomField)";
            default:
                return "string";
        }
    }

    protected function createProperty($name)
    {
        switch ($this->getPropertyType($name)) {
            case "LexAuthorInfo":
                return new LexAuthorInfo();
            case "LexMultiText":
                return new LexMultiText();
            case "Guid":
                return Guid::create();
            case "MapOf(CustomField)":
                return new MapOf("Api\Model\Languageforge\Lexicon\generateCustomField");

            case "string":
            default:
                return "";
        }
    }

    public function nameForActivityLog($preferredInputSystem = null)
    {
        if (isset($this->sentence)) {
            if (isset($preferredInputSystem) && $this->sentence->hasForm($preferredInputSystem)) {
                return $this->sentence[$preferredInputSystem];
            } elseif ($this->sentence->count() > 0) {
                foreach ($this->sentence as $inputSystem => $content) {
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

    public function getPropertyDifference(LexExample $otherExample, string $propertyName)
    {
        $type = $this->getPropertyType($propertyName);
        switch ($type) {
            case "LexMultiText":
                /** @var LexMultiText $multiText */
                $multiText = $this->$propertyName;
                $difference = $multiText->differences($otherExample->$propertyName);
                return $this->convertLexMultiTextDifferences($difference, $propertyName);
            case "string":
                $thisValue = $this->$propertyName;
                $otherValue = $otherExample->$propertyName;
                if ($thisValue === $otherValue) {
                    return [];
                } else {
                    return ["this." . $propertyName => $thisValue, "other." . $propertyName => $otherValue];
                }
            case "MapOf(CustomField)":
                // TODO: Implement this. Will probably have to refactor this function a bit to handle that one level of nesting
                return [];
            case "LexAuthorInfo":
                // We don't put authorInfo changes in the activity log
                return [];
            case "Guid":
                // We don't put translationGuid changes in the activity log either
                return [];
            default:
                return [];
        }
    }

    public function differences(LexExample $otherExample)
    {
        $properties = ["authorInfo", "sentence", "translation", "translationGuid", "reference", "customFields"];
        $result = [];
        foreach ($properties as $property) {
            foreach ($this->getPropertyDifference($otherExample, $property) as $key => $difference) {
                $result[$key] = $difference;
            }
        }
        return $result;
    }

    /**
     * The id of the example as specified in the LIFT file
     * @var string
     */
    public $liftId;

    /** @var LexMultiText */
    public $sentence;

    /** @var LexMultiText */
    public $translation;

    /** @var string */
    public $translationGuid;

    /** @var MapOf<LexMultiText|LexMultiParagraph|LexValue|LexMultiValue> */
    public $customFields;

    /** @var LexAuthorInfo */
    public $authorInfo;

    /** @var string */
    public $guid;

    // less common fields used in FLEx

    /** @var LexMultiText */
    public $reference;
}
