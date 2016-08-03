<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\MapOf;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MongoMapper;
use Api\Model\ProjectModel;
use LazyProperty\LazyPropertiesTrait;
use Palaso\Utilities\CodeGuard;

function generateSense()
{
    return new Sense();
}

function generateCustomField($data)
{
    CodeGuard::checkTypeAndThrow($data, 'array');
    if (array_key_exists('type', $data)) {
        switch ($data['type']) {
            case LexiconConfigObj::MULTIPARAGRAPH:
                return new LexMultiParagraph();
            default:
                $type = $data['type'];
                throw new \Exception("Cannot generate unknown custom field type: $type");
        }
    } elseif (array_key_exists('value', $data)) {
        return new LexiconField();
    } elseif (array_key_exists('values', $data)) {
        return new LexiconMultiValueField();
    } elseif (array_key_exists('paragraphs', $data)) {
        return new LexMultiParagraph();
    } else {
        return new MultiText();
    }
}

class LexEntryModel extends MapperModel
{
    use LazyPropertiesTrait;

    /** @var bool */
    public $isDeleted;

    /** @var IdReference */
    public $id;

    /** @var string */
    public $guid;

    /** @var int */
    public $dirtySR;

    // PUBLIC PROPERTIES

    /** @var MultiText */
    public $lexeme;

    /** @var ArrayOf<Sense> */
    public $senses;

    // REMAINING PUBLIC PROPERTIES IN ALPHABETIC ORDER

    /** @var AuthorInfo */
    public $authorInfo;

    /** @var MultiText */
    public $citationForm;

    /** @var MapOf<MultiText|LexMultiParagraph|LexiconField|LexiconMultiValueField> */
    public $customFields;

    /** @var MultiText */
    public $entryBibliography;

    /** @var MultiText */
    public $entryRestrictions;

    /** @var LexiconMultiValueField */
    public $environments;

    /** @var MultiText */
    public $etymology;

    /** @var MultiText */
    public $etymologyGloss;

    /** @var MultiText */
    public $etymologyComment;

    /** @var MultiText */
    public $etymologySource;

    /** @var MultiText */
    public $literalMeaning;

    /** @var LexiconField */
    public $location;

    /** @var string */
    public $mercurialSha;

    /** @var string */
    public $morphologyType;

    /** @var MultiText */
    public $note;

    /** @var MultiText */
    public $pronunciation;

    /**
     * cvPattern is part of pronunciation, but is under LexEntry in the LanguageForge model. REVIEW CP 2014-10
     * @var MultiText
     */
    public $cvPattern;

    /**
     * tone is part of pronunciation, but is under LexEntry in the LanguageForge model. REVIEW CP 2014-10
     * @var MultiText
     */
    public $tone;

    /** @var MultiText */
    public $summaryDefinition;

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
            'morphType',
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

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }

    protected function createProperty($name)
    {
        switch ($name) {
            case 'senses':
                return new ArrayOf('Api\Model\Languageforge\Lexicon\generateSense');
            case 'customFields':
                return new MapOf('Api\Model\Languageforge\Lexicon\generateCustomField');
            case 'authorInfo':
                return new AuthorInfo();

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
                return new MultiText();
            case 'environments':
                return new LexiconMultiValueField();
            case 'location':
                return new LexiconField();
            case 'morphologyType':
            default:
                return '';
        }
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
