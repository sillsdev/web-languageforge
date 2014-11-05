<?php

namespace models\languageforge\lexicon;

use Palaso\Utilities\CodeGuard;
use models\mapper\ArrayOf;
use models\mapper\MapOf;

function _createExample($data)
{
    return new Example();
}

function _createCustomField($data)
{
    CodeGuard::checkTypeAndThrow($data, 'array');
    if (array_key_exists('value', $data)) {
        return new LexiconField();
    } elseif (array_key_exists('values', $data)) {
        return new LexiconMultiValueField();
    } else {
        return new MultiText();
    }
}

function _createPicture($data)
{
    return new Picture();
}

class Sense
{
    use \LazyProperty\LazyPropertiesTrait;

    public function __construct($liftId = '')
    {
        $this->liftId = $liftId;
        $this->id = uniqid();

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
                'sensePublishIn',
                'anthropologyCategories',
                'status'
        ], false);

    }

    protected function createProperty($name) {
        switch ($name) {
            case 'partOfSpeech': return new LexiconField();
            case 'semanticDomain': return new LexiconMultiValueField();
            case 'examples': return new ArrayOf('\models\languageforge\lexicon\_createExample');
            case 'customFields': return new ArrayOf('\models\languageforge\lexicon\_createCustomField'); // REVIEW This should be MapOf should it not? CP 2014-09
            case 'authorInfo': return new AuthorInfo();
            case 'pictures': return new ArrayOf('\models\languageforge\lexicon\_createPicture');
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
                return new MultiText();

            case 'usages': return new LexiconMultiValueField();

            // TODO reversalEntries needs to be a Taglist 07-2014 DDW
            case 'reversalEntries': return new LexiconMultiValueField();
            case 'senseType': return new LexiconField();
            case 'academicDomains': return new LexiconMultiValueField();
            case 'sensePublishIn': return new LexiconMultiValueField();
            case 'anthropologyCategories': return new LexiconMultiValueField();
            case 'status': return new LexiconMultiValueField();
        }
    }

    /**
     * The id of the sense as specified in the LIFT file
     * @var string
     */
    public $liftId;

    /**
     * uniqid
     * @var string
     */
    public $id;

    /**
     * @var MultiText
     */
    public $definition;

    /**
     * @var MultiText
     */
    public $gloss;

    /**
     * @var ArrayOf<Picture>
     */
    public $pictures;

    /**
     * @var LexiconField
     */
    public $partOfSpeech;

    /**
     * @var LexiconMultiValueField
     */
    public $semanticDomain;

    /**
     * @var ArrayOf<Example>
     */
    public $examples;

    /**
     * @var MapOf <>
     */
    public $customFields;

    /**
     * @var AuthorInfo
     */
    public $authorInfo;

    /**
     *
     * @param string $id
     * @return Example
     */
    public function getExample($id)
    {
        foreach ($this->examples as $example) {
            if ($example->id == $id) {
                return $example;
            }
        }
    }

    /**
     *
     * @param string $id
     * @param Example $model
     */
    public function setExample($id, $model)
    {
        foreach ($this->examples as $key => $example) {
            if ($example->id == $id) {
                $this->examples[$key] = $model;
                break;
            }
        }
    }

    // less common fields used in FLEx

    /**
     * @var MultiText
     */
    public $scientificName;

    /**
     * @var MultiText
     */
    public $anthropologyNote;

    /**
     * @var MultiText
     */
    public $senseBibliography;

    /**
     * @var MultiText
     */
    public $discourseNote;

    /**
     * @var MultiText
     */
    public $encyclopedicNote;

    /**
     * @var MultiText
     */
    public $generalNote;

    /**
     * @var MultiText
     */
    public $grammarNote;

    /**
     * @var MultiText
     */
    public $phonologyNote;

    /**
     * @var MultiText
     */
    public $senseRestrictions;

    /**
     * @var MultiText
     */
    public $semanticsNote;

    /**
     * @var MultiText
     */
    public $sociolinguisticsNote;

    /**
     * @var MultiText
     */
    public $source;

    /**
     * @var LexiconMultiValueField
     */
    public $usages;

    // TODO 07-2014 DDW make this Taglist
    /**
     * @var Taglist
     */
    public $reversalEntries;

    /**
     * @var LexiconField
     */
    public $senseType;

    /**
     * @var LexiconMultiValueField
     */
    public $academicDomains;

    /**
     * @var LexiconMultiValueField
     */
    public $sensePublishIn;

    /**
     * @var LexiconMultiValueField
     */
    public $anthropologyCategories;

    /**
     * @var MultiText
     */
    public $senseImportResidue;

    /**
     * @var LexiconMultiValueField
     */
    public $status;

}
