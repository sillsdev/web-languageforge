<?php

namespace Api\Model\Languageforge\Lexicon;

use Palaso\Utilities\CodeGuard;
use Api\Model\Mapper\Id;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\MapOf;
use Api\Model\ProjectModel;
use Api\Model\Mapper\IdReference;

function _createSense($data)
{
    return new Sense();
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

class LexEntryModel extends \Api\Model\Mapper\MapperModel
{
    use \LazyProperty\LazyPropertiesTrait;

    /**
     * @var bool
     */
    public $isDeleted;

    /**
     * @var IdReference
     */
    public $id;

    /**
     * @var string
     */
    public $guid;

    // PUBLIC PROPERTIES

    /**
     * @var MultiText
     */
    public $lexeme;

    /**
     * @var ArrayOf ArrayOf<Sense>
     */
    public $senses;

    // REMAINING PUBLIC PROPERTIES IN ALPHABETIC ORDER

    // TODO Renamed $_metadata to $authorInfo, remove this comment when stitched in IJH 2013-11
    /**
     * @var AuthorInfo
     */
    public $authorInfo;

    /**
     * @var MultiText
     */
    public $citationForm;

    /**
     * @var MapOf<MultiText|LexiconField|LexiconMultiValueField>
     */
    public $customFields;

    /**
     * @var MultiText
     */
    public $entryBibliography;

    /**
     * @var MultiText
     */
    public $entryRestrictions;

    /**
     * @var LexiconMultiValueField
     */
    public $environments;

    /**
     * @var MultiText
     */
    public $etymology;

    /**
     * @var MultiText
     */
    public $etymologyGloss;

    /**
     * @var MultiText
     */
    public $etymologyComment;

    /**
     * @var MultiText
     */
    public $etymologySource;

    /**
     * @var MultiText
     */
    public $literalMeaning;

    /**
     * @var LexiconField
     */
    public $location;

    /**
     * @var string
     */
    public $mercurialSha;

    /**
     * @var string
     */
    public $morphologyType;

    /**
     * @var MultiText
     */
    public $note;

    /**
     * @var MultiText
     */
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

    /**
     * @var MultiText
     */
    public $summaryDefinition;

    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }

    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = '')
    {
        $this->setPrivateProp('guid');
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

    protected function createProperty($name)
    {
        switch ($name) {
            case 'senses':
                return new ArrayOf('Api\Model\Languageforge\Lexicon\_createSense');
            case 'customFields':
                return new MapOf('Api\Model\Languageforge\Lexicon\_createCustomField');
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
     *
     * @param string $id
     * @return Sense
     */
    public function getSense($id)
    {
        foreach ($this->senses as $sense) {
            if ($sense->id == $id) {
                return $sense;
            }
        }
    }

    /**
     *
     * @param string $id
     * @param Sense $model
     */
    public function setSense($id, $model)
    {
        foreach ($this->senses as $key => $sense) {
            if ($sense->id == $id) {
                $this->senses[$key] = $model;
                break;
            }
        }
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
