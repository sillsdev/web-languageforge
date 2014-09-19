<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ObjectForEncoding;

class LexiconConfigObj extends ObjectForEncoding
{
    public function __construct()
    {
        $this->hideIfEmpty = false;
    }

    // config types
    const FIELDLIST = 'fields';
    const MULTITEXT = 'multitext';
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
    const SENSEPUBLISHIN = 'sensePublishIn';
    const ANTHROPOLOGYCATEGORIES = 'anthropologyCategories';
    const SENSEIMPORTRESIDUE = 'senseImportResidue';
    const STATUS = 'status';


    const REFERENCE = 'reference';
    const EXAMPLEPUBLISHIN = 'examplePublishIn';

    // field lists
    const SENSES_LIST = 'senses';
    const EXAMPLES_LIST = 'examples';
    //const CUSTOM_FIELDS_LIST = 'customFields';


    // comments
    const COMMENTS_LIST = 'comments';
    const REPLIES_LIST = 'replies';

    /**
     * @var string
     */
    public $type;

    /**
     * @var boolean
     */
    public $hideIfEmpty;

}
