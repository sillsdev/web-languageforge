<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;

class LexConfiguration
{
    /** @var MapOf <LexTask> */
    public $tasks;

    /** @var LexConfigFieldList */
    public $entry;

    /**
     * key is LexRoles const
     * @var MapOf <LexRoleViewConfig>
     */
    public $roleViews;

    /**
     * key is userId
     * @var MapOf <LexUserViewConfig>
     */
    public $userViews;

    public function __construct()
    {
        $this->tasks = new MapOf(
            function ($data) {
                switch ($data['type']) {
                    case LexTask::DASHBOARD:
                        return new LexTaskDashboard();
                    case LexTask::SEMDOM:
                        return new LexTaskSemdom();
                    default:
                        return new LexTask();
                }
            }
        );

        $this->roleViews = new MapOf(function () {
            return new LexRoleViewConfig();
        });

        $this->userViews = new MapOf(function () {
            return new LexUserViewConfig();
        });

        // default tasks values
        $this->tasks[LexTask::VIEW] = new LexTask();
        $this->tasks[LexTask::DASHBOARD] = new LexTaskDashboard();
        $this->tasks[LexTask::GATHERTEXTS] = new LexTask();
        $this->tasks[LexTask::SEMDOM] = new LexTaskSemdom();
        $this->tasks[LexTask::WORDLIST] = new LexTask();
        $this->tasks[LexTask::DBE] = new LexTask();
        $this->tasks[LexTask::ADDMEANINGS] = new LexTask();
        $this->tasks[LexTask::ADDGRAMMAR] = new LexTask();
        $this->tasks[LexTask::ADDEXAMPLES] = new LexTask();
        $this->tasks[LexTask::REVIEW] = new LexTask();
        $this->tasks[LexTask::IMPORTEXPORT] = new LexTask();
        $this->tasks[LexTask::CONFIGURATION] = new LexTask();

        // default entry fields values
        $this->entry = new LexConfigFieldList();
        $this->entry->fieldOrder[] = LexConfig::LEXEME;
        $this->entry->fieldOrder[] = LexConfig::CITATIONFORM;
        //$this->entry->fieldOrder[] = LexConfig::ENVIRONMENTS; // Disabled 05-2016
        $this->entry->fieldOrder[] = LexConfig::PRONUNCIATION;
        $this->entry->fieldOrder[] = LexConfig::CVPATTERN;
        $this->entry->fieldOrder[] = LexConfig::TONE;
        $this->entry->fieldOrder[] = LexConfig::LOCATION;
        $this->entry->fieldOrder[] = LexConfig::ETYMOLOGY;
        $this->entry->fieldOrder[] = LexConfig::ETYMOLOGYGLOSS;
        $this->entry->fieldOrder[] = LexConfig::ETYMOLOGYCOMMENT;
        $this->entry->fieldOrder[] = LexConfig::ETYMOLOGYSOURCE;
        $this->entry->fieldOrder[] = LexConfig::NOTE;
        $this->entry->fieldOrder[] = LexConfig::LITERALMEANING;
        $this->entry->fieldOrder[] = LexConfig::ENTRYBIBLIOGRAPHY;
        $this->entry->fieldOrder[] = LexConfig::ENTRYRESTRICTIONS;
        $this->entry->fieldOrder[] = LexConfig::SUMMARYDEFINITION;
        $this->entry->fieldOrder[] = LexConfig::ENTRYIMPORTRESIDUE;

        $this->entry->fieldOrder[] = LexConfig::SENSES_LIST;

        $this->entry->fields[LexConfig::LEXEME] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::LEXEME]->label = 'Word';
        $this->entry->fields[LexConfig::LEXEME]->inputSystems[] = 'th';

        $this->entry->fields[LexConfig::SENSES_LIST] = new LexConfigFieldList();
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::DEFINITION;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::GLOSS;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::PICTURES;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::POS;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SEMDOM;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SCIENTIFICNAME;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::ANTHROPOLOGYNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SENSEBIBLIOGRAPHY;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::DISCOURSENOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::ENCYCLOPEDICNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::GENERALNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::GRAMMARNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::PHONOLOGYNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SENSERESTRCTIONS;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SEMANTICSNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SOCIOLINGUISTICSNOTE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SOURCE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::USAGES;
        //$this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::REVERSALENTRIES; // Disabled 05-2016
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SENSETYPE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::ACADEMICDOMAINS;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::ANTHROPOLOGYCATEGORIES;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::SENSEIMPORTRESIDUE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::STATUS;
        $this->entry->fields[LexConfig::SENSES_LIST]->fieldOrder[] = LexConfig::EXAMPLES_LIST;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DEFINITION] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DEFINITION]->label = 'Definition';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DEFINITION]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::POS] = new LexConfigOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::POS);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::POS]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::POS]->listCode = $listCode;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMDOM] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::SEMDOM);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMDOM]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMDOM]->listCode = $listCode;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST] = new LexConfigFieldList();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fieldOrder[] = LexConfig::EXAMPLE_SENTENCE;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fieldOrder[] = LexConfig::EXAMPLE_TRANSLATION;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fieldOrder[] = LexConfig::REFERENCE;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_SENTENCE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_SENTENCE]->label = 'Sentence';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_SENTENCE]->inputSystems[] = 'th';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_TRANSLATION] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_TRANSLATION]->label = 'Translation';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_TRANSLATION]->inputSystems[] = 'en';

        //$this->entry->fields[LexConfig::CUSTOM_FIELDS_LIST] = new LexConfigFieldList();
        //$this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::CUSTOM_FIELDS_LIST] = new LexConfigFieldList();
        //$this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::CUSTOM_FIELDS_LIST] = new LexConfigFieldList();

        /*  Configuration for less common fields (mostly used in FLEx are defined below) */

        $this->entry->fields[LexConfig::CITATIONFORM] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::CITATIONFORM]->label = 'Citation Form';
        $this->entry->fields[LexConfig::CITATIONFORM]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::CITATIONFORM]->inputSystems[] = 'th';

        /*
        ENVIRONMENTS disabled 05-2016
        $this->entry->fields[LexConfig::ENVIRONMENTS] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::ENVIRONMENTS);
        $this->entry->fields[LexConfig::ENVIRONMENTS]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::ENVIRONMENTS]->listCode = $listCode;
        $this->entry->fields[LexConfig::ENVIRONMENTS]->hideIfEmpty = true;
        */
        $this->entry->fields[LexConfig::PRONUNCIATION] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::PRONUNCIATION]->label = 'Pronunciation';
        $this->entry->fields[LexConfig::PRONUNCIATION]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::PRONUNCIATION]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::CVPATTERN] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::CVPATTERN]->label = 'CV Pattern';
        $this->entry->fields[LexConfig::CVPATTERN]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::CVPATTERN]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::TONE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::TONE]->label = 'Tone';
        $this->entry->fields[LexConfig::TONE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::TONE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::LOCATION] = new LexConfigOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::LOCATION);
        $this->entry->fields[LexConfig::LOCATION]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::LOCATION]->listCode = $listCode;
        $this->entry->fields[LexConfig::LOCATION]->hideIfEmpty = true;

        $this->entry->fields[LexConfig::ETYMOLOGY] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ETYMOLOGY]->label = 'Etymology';
        $this->entry->fields[LexConfig::ETYMOLOGY]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ETYMOLOGY]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ETYMOLOGYGLOSS] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ETYMOLOGYGLOSS]->label = 'Etymology Gloss';
        $this->entry->fields[LexConfig::ETYMOLOGYGLOSS]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ETYMOLOGYGLOSS]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ETYMOLOGYCOMMENT] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ETYMOLOGYCOMMENT]->label = 'Etymology Comment';
        $this->entry->fields[LexConfig::ETYMOLOGYCOMMENT]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ETYMOLOGYCOMMENT]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ETYMOLOGYSOURCE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ETYMOLOGYSOURCE]->label = 'Etymology Source';
        $this->entry->fields[LexConfig::ETYMOLOGYSOURCE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ETYMOLOGYSOURCE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::NOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::NOTE]->label = 'Note';
        $this->entry->fields[LexConfig::NOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::NOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::LITERALMEANING] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::LITERALMEANING]->label = 'Literal Meaning';
        $this->entry->fields[LexConfig::LITERALMEANING]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::LITERALMEANING]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ENTRYBIBLIOGRAPHY] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ENTRYBIBLIOGRAPHY]->label = 'Bibliography';
        $this->entry->fields[LexConfig::ENTRYBIBLIOGRAPHY]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ENTRYBIBLIOGRAPHY]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ENTRYRESTRICTIONS] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ENTRYRESTRICTIONS]->label = 'Restrictions';
        $this->entry->fields[LexConfig::ENTRYRESTRICTIONS]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ENTRYRESTRICTIONS]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SUMMARYDEFINITION] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SUMMARYDEFINITION]->label = 'Summary Definition';
        $this->entry->fields[LexConfig::SUMMARYDEFINITION]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SUMMARYDEFINITION]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::ENTRYIMPORTRESIDUE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::ENTRYIMPORTRESIDUE]->label = 'Import Residue';
        $this->entry->fields[LexConfig::ENTRYIMPORTRESIDUE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::ENTRYIMPORTRESIDUE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GLOSS] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GLOSS]->label = 'Gloss';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GLOSS]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GLOSS]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES] = new LexConfigPictures();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES]->label = 'Pictures';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES]->captionLabel = 'Captions';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES]->captionHideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PICTURES]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SCIENTIFICNAME] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SCIENTIFICNAME]->label = 'Scientific Name';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SCIENTIFICNAME]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SCIENTIFICNAME]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYNOTE]->label = 'Anthropology Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEBIBLIOGRAPHY] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEBIBLIOGRAPHY]->label = 'Bibliography';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEBIBLIOGRAPHY]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEBIBLIOGRAPHY]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DISCOURSENOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DISCOURSENOTE]->label = 'Discourse Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DISCOURSENOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DISCOURSENOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ENCYCLOPEDICNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ENCYCLOPEDICNOTE]->label = 'Encyclopedic Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ENCYCLOPEDICNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ENCYCLOPEDICNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GENERALNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GENERALNOTE]->label = 'General Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GENERALNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GENERALNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GRAMMARNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GRAMMARNOTE]->label = 'Grammar Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GRAMMARNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::GRAMMARNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PHONOLOGYNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PHONOLOGYNOTE]->label = 'Phonology Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PHONOLOGYNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::PHONOLOGYNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSERESTRCTIONS] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSERESTRCTIONS]->label = 'Restrictions';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSERESTRCTIONS]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSERESTRCTIONS]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMANTICSNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMANTICSNOTE]->label = 'Semantics Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMANTICSNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SEMANTICSNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOCIOLINGUISTICSNOTE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOCIOLINGUISTICSNOTE]->label = 'Sociolinguistics Note';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOCIOLINGUISTICSNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOCIOLINGUISTICSNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOURCE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOURCE]->label = 'Source';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOURCE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SOURCE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::USAGES] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::USAGES);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::USAGES]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::USAGES]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::USAGES]->hideIfEmpty = true;

        // TODO This needs to be a taglist DDW 2014-07
        /*
        REVERSALENTRIES disabled 05-2016
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::REVERSALENTRIES] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::REVERSALENTRIES);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::REVERSALENTRIES]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::REVERSALENTRIES]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::REVERSALENTRIES]->hideIfEmpty = true;
        */

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSETYPE] = new LexConfigOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::SENSETYPE);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSETYPE]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSETYPE]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSETYPE]->hideIfEmpty = true;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ACADEMICDOMAINS] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::ACADEMICDOMAINS);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ACADEMICDOMAINS]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ACADEMICDOMAINS]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ACADEMICDOMAINS]->hideIfEmpty = true;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYCATEGORIES] = new LexConfigMultiOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::ANTHROPOLOGYCATEGORIES);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYCATEGORIES]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYCATEGORIES]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::ANTHROPOLOGYCATEGORIES]->hideIfEmpty = true;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEIMPORTRESIDUE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEIMPORTRESIDUE]->label = 'Import Residue';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEIMPORTRESIDUE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::SENSEIMPORTRESIDUE]->inputSystems[] = 'en';

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::STATUS] = new LexConfigOptionList();
        $listCode = LexConfig::flexOptionlistCode(LexConfig::STATUS);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::STATUS]->label = LexConfig::flexOptionlistName($listCode);
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::STATUS]->listCode = $listCode;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::STATUS]->hideIfEmpty = true;

        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::REFERENCE] = new LexConfigMultiText();
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::REFERENCE]->label = 'Reference';
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::REFERENCE]->hideIfEmpty = true;
        $this->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::REFERENCE]->inputSystems[] = 'en';

        // default role views values
        $this->roleViews[LexRoles::OBSERVER] = new LexRoleViewConfig();
        $this->roleViews[LexRoles::OBSERVER_WITH_COMMENT] = new LexRoleViewConfig();
        $this->roleViews[LexRoles::CONTRIBUTOR] = new LexRoleViewConfig();
        $this->roleViews[LexRoles::MANAGER] = new LexRoleViewConfig();

        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::LEXEME] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::DEFINITION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::POS] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SEMDOM] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::EXAMPLE_SENTENCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::EXAMPLE_TRANSLATION] = new LexViewMultiTextFieldConfig(true);

        // Less common fields are visible by default
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::GLOSS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::PICTURES] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::CITATIONFORM] = new LexViewMultiTextFieldConfig(true);
        //$this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ENVIRONMENTS] = new LexViewFieldConfig(true); // Disabled 05-2016
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::PRONUNCIATION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::CVPATTERN] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::TONE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::LOCATION] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ETYMOLOGY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ETYMOLOGYGLOSS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ETYMOLOGYCOMMENT] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ETYMOLOGYSOURCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::NOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::LITERALMEANING] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ENTRYBIBLIOGRAPHY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ENTRYRESTRICTIONS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SUMMARYDEFINITION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ENTRYIMPORTRESIDUE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SCIENTIFICNAME] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ANTHROPOLOGYNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SENSEBIBLIOGRAPHY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::DISCOURSENOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ENCYCLOPEDICNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::GENERALNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::GRAMMARNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::PHONOLOGYNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SENSERESTRCTIONS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SEMANTICSNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SOCIOLINGUISTICSNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SOURCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::USAGES] = new LexViewFieldConfig(true);
        //$this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::REVERSALENTRIES] = new LexViewFieldConfig(true); // Disabled 05-2016
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SENSETYPE] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ACADEMICDOMAINS] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::ANTHROPOLOGYCATEGORIES] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::SENSEIMPORTRESIDUE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::STATUS] = new LexViewFieldConfig(true);
        $this->roleViews[LexRoles::OBSERVER]->fields[LexConfig::REFERENCE] = new LexViewMultiTextFieldConfig(true);

        $this->roleViews[LexRoles::OBSERVER_WITH_COMMENT]->fields = clone $this->roleViews[LexRoles::OBSERVER]->fields;
        $this->roleViews[LexRoles::CONTRIBUTOR]->fields = clone $this->roleViews[LexRoles::OBSERVER]->fields;
        $this->roleViews[LexRoles::MANAGER]->fields = clone $this->roleViews[LexRoles::OBSERVER]->fields;

        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::VIEW] = true;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::DASHBOARD] = true;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::GATHERTEXTS] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::SEMDOM] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::WORDLIST] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::DBE] = true;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::ADDMEANINGS] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::ADDGRAMMAR] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::ADDEXAMPLES] = false;
        $this->roleViews[LexRoles::OBSERVER]->showTasks[LexTask::REVIEW] = false;

        $this->roleViews[LexRoles::OBSERVER_WITH_COMMENT]->showTasks = clone $this->roleViews[LexRoles::OBSERVER]->showTasks;

        $this->roleViews[LexRoles::CONTRIBUTOR]->showTasks = clone $this->roleViews[LexRoles::OBSERVER]->showTasks;
        $this->roleViews[LexRoles::CONTRIBUTOR]->showTasks[LexTask::ADDMEANINGS] = true;
        $this->roleViews[LexRoles::CONTRIBUTOR]->showTasks[LexTask::ADDGRAMMAR] = true;
        $this->roleViews[LexRoles::CONTRIBUTOR]->showTasks[LexTask::ADDEXAMPLES] = true;

        $this->roleViews[LexRoles::MANAGER]->showTasks = clone $this->roleViews[LexRoles::CONTRIBUTOR]->showTasks;
        $this->roleViews[LexRoles::MANAGER]->showTasks[LexTask::GATHERTEXTS] = true;
        $this->roleViews[LexRoles::MANAGER]->showTasks[LexTask::SEMDOM] = true;
        $this->roleViews[LexRoles::MANAGER]->showTasks[LexTask::WORDLIST] = true;
        $this->roleViews[LexRoles::MANAGER]->showTasks[LexTask::REVIEW] = true;

    }

    /**
     * Clear all field config input systems
     */
    public function clearAllInputSystems() {
        self::setAllInputSystems($this->entry, new ArrayOf());
    }

    /**
     * Recursively set all field input systems
     *
     * @param LexConfigFieldList $fieldListConfig
     * @param ArrayOf $inputSystems
     */
    private static function setAllInputSystems($fieldListConfig, $inputSystems) {
        foreach($fieldListConfig->fieldOrder as $fieldName) {
            if ($fieldListConfig->fields[$fieldName]->type == 'fields') {
                self::setAllInputSystems($fieldListConfig->fields[$fieldName], $inputSystems);
            } else {
                if (isset($fieldListConfig->fields[$fieldName]->inputSystems)) {
                    $fieldListConfig->fields[$fieldName]->inputSystems = clone $inputSystems;
                }
            }
        }
    }
}
