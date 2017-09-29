<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Shared\Mapper\ObjectForEncoding;

class LexConfig extends ObjectForEncoding
{
    public function __construct()
    {
        $this->hideIfEmpty = false;
        $this->label = '';
    }

    // config types
    const FIELDLIST = 'fields';
    const MULTITEXT = 'multitext';
    const MULTIPARAGRAPH = 'multiparagraph';
    const OPTIONLIST = 'optionlist';
    const MULTIOPTIONLIST = 'multioptionlist';

    // fields
    const LEXEME = 'lexeme';
    const DEFINITION = 'definition';
    const GLOSS = 'gloss';
    const POS = 'partOfSpeech';
    const PICTURES = 'pictures';
    const SEMDOM = 'semanticDomain';
    const EXAMPLE_SENTENCE = 'sentence';
    const EXAMPLE_TRANSLATION = 'translation';

    // less common FLEx fields
    const CITATIONFORM = 'citationForm';
    const ENVIRONMENTS = 'environments';
    const PRONUNCIATION = 'pronunciation';
    const CVPATTERN = 'cvPattern';
    const TONE = 'tone';
    const LOCATION = 'location';
    const ETYMOLOGY = 'etymology';
    const ETYMOLOGYGLOSS = 'etymologyGloss';
    const ETYMOLOGYCOMMENT = 'etymologyComment';
    const ETYMOLOGYSOURCE = 'etymologySource';
    const NOTE = 'note';
    const LITERALMEANING = 'literalMeaning';
    const ENTRYBIBLIOGRAPHY = 'entryBibliography';
    const ENTRYRESTRICTIONS = 'entryRestrictions';
    const SUMMARYDEFINITION = 'summaryDefinition';
    const ENTRYIMPORTRESIDUE = 'entryImportResidue';

    const SCIENTIFICNAME = 'scientificName';
    const ANTHROPOLOGYNOTE = 'anthropologyNote';
    const SENSEBIBLIOGRAPHY = 'senseBibliography';
    const DISCOURSENOTE = 'discourseNote';
    const ENCYCLOPEDICNOTE = 'encyclopedicNote';
    const GENERALNOTE ='generalNote';
    const GRAMMARNOTE = 'grammarNote';
    const PHONOLOGYNOTE = 'phonologyNote';
    const SENSERESTRCTIONS = 'senseRestrictions';
    const SEMANTICSNOTE = 'semanticsNote';
    const SOCIOLINGUISTICSNOTE = 'sociolinguisticsNote';
    const SOURCE = 'source';
    const USAGES = 'usages';
    const REVERSALENTRIES = 'reversalEntries';
    const SENSETYPE = 'senseType';
    const ACADEMICDOMAINS = 'academicDomains';
    const ANTHROPOLOGYCATEGORIES = 'anthropologyCategories';
    const SENSEIMPORTRESIDUE = 'senseImportResidue';
    const STATUS = 'status';


    const REFERENCE = 'reference';

    // field lists
    const SENSES_LIST = 'senses';
    const EXAMPLES_LIST = 'examples';
    //const CUSTOM_FIELDS_LIST = 'customFields';


    // comments
    const COMMENTS_LIST = 'comments';
    const REPLIES_LIST = 'replies';

    /** @var string */
    public $type;

    /** @var string */
    public $label;
    
    /** @var boolean */
    public $hideIfEmpty;

    /**
     * Index of field names (key) against FLEx option list codes (value)
     * If the FLEx code is not known the field name is used
     *
     * @var array
     */
    private static $flexOptionlistCodes = array(
        self::POS => 'grammatical-info',
        self::SEMDOM => 'semantic-domain-ddp4',
        self::ENVIRONMENTS => self::ENVIRONMENTS,
        self::LOCATION => 'location',
        self::USAGES => 'usage-type',
        self::REVERSALENTRIES => 'reversal-type',
        self::SENSETYPE => 'sense-type',
        self::ACADEMICDOMAINS => 'domain-type',
        self::ANTHROPOLOGYCATEGORIES => 'anthro-code',
        self::STATUS => 'status',
    );

    /**
     * Returns the FLEx option list code given the field name
     * If the code is unknown the field name is returned
     *
     * @param string $fieldName
     * @return string
    */
    public static function flexOptionlistCode($fieldName) {
        if (array_key_exists($fieldName, self::$flexOptionlistCodes)) {
            return self::$flexOptionlistCodes[$fieldName];
        }
        return $fieldName;
    }

    /**
     * Index of FLEx option list codes (key) against option list names (value)
     *
     * @var array
     */
    private static $flexOptionlistNames = array(
        'grammatical-info' => 'Part of Speech',
        'semantic-domain-ddp4' => 'Semantic Domain',
        'domain-type' => 'Academic Domains',
        self::ENVIRONMENTS => 'Environments',
        'location' => 'Location',
        'usage-type' => 'Usages',
        'reversal-type' => 'Reversal Entries',
        'sense-type' => 'Type',
        'anthro-code' => 'Anthropology Categories',
        'do-not-publish-in' => 'Publish In',
        'status' => 'Status',

        'etymology' => 'Etymology',
        'lexical-relation' => 'Lexical Relation',
        'note-type' => 'Note Type',
        'paradigm' => 'Paradigm',
        'users' => 'Users',
        'translation-type' => 'Translation Type',
        'from-part-of-speech' => 'From Part of Speech',
        'morph-type' => 'Morph Type',
        'noun-slot' => 'Noun Slot',
        'verb-slot' => 'Verb Slot',
        'stative-slot' => 'Stative Slot',
        'noun-infl-class' => 'Noun Inflection Class',
        'verb-infl-class' => 'Verb Inflection Class'
    );

    /**
     * Returns the option list name given the FLEx option list code
     * If the name is unknown the code is returned
     *
     * @param string $listCode
     * @return string
     */
    public static function flexOptionlistName($listCode) {
        if (array_key_exists($listCode, self::$flexOptionlistNames)) {
            return self::$flexOptionlistNames[$listCode];
        }
        return $listCode;
    }
}
