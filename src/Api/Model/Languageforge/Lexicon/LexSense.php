<?php

namespace Api\Model\Languageforge\Lexicon;

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

    public function __construct($liftId = '', $guid = '')
    {
        $this->setPrivateProp('liftId');
        $this->setReadOnlyProp('guid');
        $this->setReadOnlyProp('authorInfo');
        if ($liftId) $this->liftId = $liftId;
        $this->guid = Guid::makeValid($guid);

        $this->initLazyProperties([
                'partOfSpeech',
                'semanticDomain',
                'examples',
                'customFields',
                'authorInfo',
                'definition',
                'gloss',
                'pictures',
                'scientificName',
                'anthropologyNote',
                'senseBibliography',
                'discourseNote',
                'encyclopedicNote',
                'generalNote',
                'grammarNote',
                'phonologyNote',
                'senseRestrictions',
                'semanticsNote',
                'sociolinguisticsNote',
                'source',
                'senseImportResidue',
                'usages',
                'reversalEntries',
                'senseType',
                'academicDomains',
                'anthropologyCategories',
                'status'
        ], false);

    }

    protected function createProperty($name) {
        switch ($name) {
            case 'partOfSpeech': return new LexValue();
            case 'semanticDomain': return new LexMultiValue();
            case 'examples': return new ArrayOf('Api\Model\Languageforge\Lexicon\generateExample');
            case 'customFields': return new MapOf('Api\Model\Languageforge\Lexicon\generateCustomField');
            case 'authorInfo': return new LexAuthorInfo();
            case 'pictures': return new ArrayOf('Api\Model\Languageforge\Lexicon\generatePicture');

            case 'definition':
            case 'gloss':
            case 'scientificName':
            case 'anthropologyNote':
            case 'senseBibliography':
            case 'discourseNote':
            case 'encyclopedicNote':
            case 'generalNote':
            case 'grammarNote':
            case 'phonologyNote':
            case 'senseRestrictions':
            case 'semanticsNote':
            case 'sociolinguisticsNote':
            case 'source':
            case 'senseImportResidue':
                return new LexMultiText();

            case 'usages': return new LexMultiValue();

            // TODO reversalEntries needs to be a Taglist 07-2014 DDW
            case 'reversalEntries': return new LexMultiValue();
            case 'senseType': return new LexValue();
            case 'academicDomains': return new LexMultiValue();
            case 'anthropologyCategories': return new LexMultiValue();
            case 'status': return new LexMultiValue();
            default:
                return '';
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
            if (isset($picture->{$propertyName}) && (trim($picture->{$propertyName}) !== '') && ($picture->{$propertyName} == $value)) {
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
            if (isset($example->{$propertyName}) && (trim($example->{$propertyName}) !== '') && ($example->{$propertyName} == $value)) {
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
            if (isset($example->{$propertyName}) &&
                array_key_exists($tag, $example->{$propertyName}) && (trim($example->{$propertyName}[$tag]) !== '') &&
                ($example->{$propertyName}[$tag] == $text)) {
                return $index;
            }
        }
        return -1;
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

    /** @var LexMultiValue */
    public $status;
}
