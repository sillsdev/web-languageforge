<?php

namespace models\languageforge\lexicon\config;

use models\languageforge\lexicon\LexiconRoles;
use models\mapper\MapOf;

class LexConfiguration
{
    /**
     *
     * @var MapOf <LexiconTask>
     */
    public $tasks;

    /**
     *
     * @var LexiconFieldListConfigObj
     */
    public $entry;

    /**
     * key is LexiconRoles const
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
                    case LexiconTask::DASHBOARD:
                        return new LexiconDashboardTask();
                    case LexiconTask::SEMDOM:
                        return new LexiconSemdomTask();
                    default:
                        return new LexiconTask();
                }
            }
        );

        $this->roleViews = new MapOf(function ($data) {
            return new LexRoleViewConfig();
        });

        $this->userViews = new MapOf(function ($data) {
            return new LexUserViewConfig();
        });

        // default tasks values
        $this->tasks[LexiconTask::VIEW] = new LexiconTask();
        $this->tasks[LexiconTask::DASHBOARD] = new LexiconDashboardTask();
        $this->tasks[LexiconTask::GATHERTEXTS] = new LexiconTask();
        $this->tasks[LexiconTask::SEMDOM] = new LexiconSemdomTask();
        $this->tasks[LexiconTask::WORDLIST] = new LexiconTask();
        $this->tasks[LexiconTask::DBE] = new LexiconTask();
        $this->tasks[LexiconTask::ADDMEANINGS] = new LexiconTask();
        $this->tasks[LexiconTask::ADDGRAMMAR] = new LexiconTask();
        $this->tasks[LexiconTask::ADDEXAMPLES] = new LexiconTask();
        $this->tasks[LexiconTask::REVIEW] = new LexiconTask();
        $this->tasks[LexiconTask::IMPORTEXPORT] = new LexiconTask();
        $this->tasks[LexiconTask::CONFIGURATION] = new LexiconTask();

        // default entry fields values
        $this->entry = new LexiconFieldListConfigObj();
        $this->entry->fieldOrder[] = LexiconConfigObj::LEXEME;
        $this->entry->fieldOrder[] = LexiconConfigObj::CITATIONFORM;
        $this->entry->fieldOrder[] = LexiconConfigObj::ENVIRONMENTS;
        $this->entry->fieldOrder[] = LexiconConfigObj::PRONUNCIATION;
        $this->entry->fieldOrder[] = LexiconConfigObj::CVPATTERN;
        $this->entry->fieldOrder[] = LexiconConfigObj::TONE;
        $this->entry->fieldOrder[] = LexiconConfigObj::LOCATION;
        $this->entry->fieldOrder[] = LexiconConfigObj::ETYMOLOGY;
        $this->entry->fieldOrder[] = LexiconConfigObj::ETYMOLOGYGLOSS;
        $this->entry->fieldOrder[] = LexiconConfigObj::ETYMOLOGYCOMMENT;
        $this->entry->fieldOrder[] = LexiconConfigObj::ETYMOLOGYSOURCE;
        $this->entry->fieldOrder[] = LexiconConfigObj::NOTE;
        $this->entry->fieldOrder[] = LexiconConfigObj::LITERALMEANING;
        $this->entry->fieldOrder[] = LexiconConfigObj::ENTRYBIBLIOGRAPHY;
        $this->entry->fieldOrder[] = LexiconConfigObj::ENTRYRESTRICTIONS;
        $this->entry->fieldOrder[] = LexiconConfigObj::SUMMARYDEFINITION;
        $this->entry->fieldOrder[] = LexiconConfigObj::ENTRYIMPORTRESIDUE;

        $this->entry->fieldOrder[] = LexiconConfigObj::SENSES_LIST;

        $this->entry->fields[LexiconConfigObj::LEXEME] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::LEXEME]->label = 'Word';
        $this->entry->fields[LexiconConfigObj::LEXEME]->inputSystems[] = 'th';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST] = new LexiconFieldListConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::DEFINITION;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::GLOSS;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::PICTURES;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::POS;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SEMDOM;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SCIENTIFICNAME;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::ANTHROPOLOGYNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SENSEBIBLIOGRAPHY;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::DISCOURSENOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::ENCYCLOPEDICNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::GENERALNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::GRAMMARNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::PHONOLOGYNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SENSERESTRCTIONS;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SEMANTICSNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SOCIOLINGUISTICSNOTE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SOURCE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::USAGES;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::REVERSALENTRIES;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SENSETYPE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::ACADEMICDOMAINS;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SENSEPUBLISHIN;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::ANTHROPOLOGYCATEGORIES;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::SENSEIMPORTRESIDUE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::STATUS;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLES_LIST;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->label = 'Meaning';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS] = new LexiconOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::POS);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::POS]->listCode = $listCode;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::SEMDOM);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMDOM]->listCode = $listCode;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST] = new LexiconFieldListConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLE_SENTENCE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLE_TRANSLATION;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::REFERENCE;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fieldOrder[] = LexiconConfigObj::EXAMPLEPUBLISHIN;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->label = 'Example';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems[] = 'th';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->label = 'Translation';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems[] = 'en';

        //$this->entry->fields[LexiconConfigObj::CUSTOM_FIELDS_LIST] = new LexiconFieldListConfigObj();
        //$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::CUSTOM_FIELDS_LIST] = new LexiconFieldListConfigObj();
        //$this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::CUSTOM_FIELDS_LIST] = new LexiconFieldListConfigObj();

        /*  Configuration for less common fields (mostly used in FLEx are defined below) */

        $this->entry->fields[LexiconConfigObj::CITATIONFORM] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::CITATIONFORM]->label = 'Citation Form';
        $this->entry->fields[LexiconConfigObj::CITATIONFORM]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::CITATIONFORM]->inputSystems[] = 'th';

        $this->entry->fields[LexiconConfigObj::ENVIRONMENTS] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::ENVIRONMENTS);
        $this->entry->fields[LexiconConfigObj::ENVIRONMENTS]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::ENVIRONMENTS]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::ENVIRONMENTS]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::PRONUNCIATION] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::PRONUNCIATION]->label = 'Pronunciation';
        $this->entry->fields[LexiconConfigObj::PRONUNCIATION]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::PRONUNCIATION]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::CVPATTERN] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::CVPATTERN]->label = 'CV Pattern';
        $this->entry->fields[LexiconConfigObj::CVPATTERN]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::CVPATTERN]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::TONE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::TONE]->label = 'Tone';
        $this->entry->fields[LexiconConfigObj::TONE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::TONE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::LOCATION] = new LexiconOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::LOCATION);
        $this->entry->fields[LexiconConfigObj::LOCATION]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::LOCATION]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::LOCATION]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::ETYMOLOGY] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ETYMOLOGY]->label = 'Etymology';
        $this->entry->fields[LexiconConfigObj::ETYMOLOGY]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ETYMOLOGY]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ETYMOLOGYGLOSS] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYGLOSS]->label = 'Etymology Gloss';
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYGLOSS]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYGLOSS]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ETYMOLOGYCOMMENT] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYCOMMENT]->label = 'Etymology Comment';
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYCOMMENT]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYCOMMENT]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ETYMOLOGYSOURCE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYSOURCE]->label = 'Etymology Source';
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYSOURCE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ETYMOLOGYSOURCE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::NOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::NOTE]->label = 'Note';
        $this->entry->fields[LexiconConfigObj::NOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::NOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::LITERALMEANING] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::LITERALMEANING]->label = 'Literal Meaning';
        $this->entry->fields[LexiconConfigObj::LITERALMEANING]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::LITERALMEANING]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ENTRYBIBLIOGRAPHY] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ENTRYBIBLIOGRAPHY]->label = 'Bibliography';
        $this->entry->fields[LexiconConfigObj::ENTRYBIBLIOGRAPHY]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ENTRYBIBLIOGRAPHY]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ENTRYRESTRICTIONS] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ENTRYRESTRICTIONS]->label = 'Restrictions';
        $this->entry->fields[LexiconConfigObj::ENTRYRESTRICTIONS]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ENTRYRESTRICTIONS]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SUMMARYDEFINITION] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SUMMARYDEFINITION]->label = 'Summary Definition';
        $this->entry->fields[LexiconConfigObj::SUMMARYDEFINITION]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SUMMARYDEFINITION]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::ENTRYIMPORTRESIDUE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::ENTRYIMPORTRESIDUE]->label = 'Import Residue';
        $this->entry->fields[LexiconConfigObj::ENTRYIMPORTRESIDUE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::ENTRYIMPORTRESIDUE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->label = 'Gloss';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES] = new LexPicturesConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->label = 'Pictures';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->captionLabel = 'Captions';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->captionHideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PICTURES]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SCIENTIFICNAME] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SCIENTIFICNAME]->label = 'Scientific Name';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SCIENTIFICNAME]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SCIENTIFICNAME]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYNOTE]->label = 'Anthropology Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEBIBLIOGRAPHY] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEBIBLIOGRAPHY]->label = 'Bibliography';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEBIBLIOGRAPHY]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEBIBLIOGRAPHY]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DISCOURSENOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DISCOURSENOTE]->label = 'Discourse Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DISCOURSENOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DISCOURSENOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ENCYCLOPEDICNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ENCYCLOPEDICNOTE]->label = 'Encyclopedic Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ENCYCLOPEDICNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ENCYCLOPEDICNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GENERALNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GENERALNOTE]->label = 'General Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GENERALNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GENERALNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GRAMMARNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GRAMMARNOTE]->label = 'Grammar Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GRAMMARNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GRAMMARNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PHONOLOGYNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PHONOLOGYNOTE]->label = 'Phonology Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PHONOLOGYNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::PHONOLOGYNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSERESTRCTIONS] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSERESTRCTIONS]->label = 'Restrictions';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSERESTRCTIONS]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSERESTRCTIONS]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMANTICSNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMANTICSNOTE]->label = 'Semantics Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMANTICSNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SEMANTICSNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOCIOLINGUISTICSNOTE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOCIOLINGUISTICSNOTE]->label = 'Sociolinguistics Note';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOCIOLINGUISTICSNOTE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOCIOLINGUISTICSNOTE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOURCE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOURCE]->label = 'Source';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOURCE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SOURCE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::USAGES] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::USAGES);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::USAGES]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::USAGES]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::USAGES]->hideIfEmpty = true;

        // TODO This needs to be a taglist DDW 2014-07
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::REVERSALENTRIES] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::REVERSALENTRIES);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::REVERSALENTRIES]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::REVERSALENTRIES]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::REVERSALENTRIES]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSETYPE] = new LexiconOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::SENSETYPE);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSETYPE]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSETYPE]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSETYPE]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ACADEMICDOMAINS] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::ACADEMICDOMAINS);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ACADEMICDOMAINS]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ACADEMICDOMAINS]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ACADEMICDOMAINS]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEPUBLISHIN] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::SENSEPUBLISHIN);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEPUBLISHIN]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEPUBLISHIN]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEPUBLISHIN]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYCATEGORIES] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::ANTHROPOLOGYCATEGORIES);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYCATEGORIES]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYCATEGORIES]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::ANTHROPOLOGYCATEGORIES]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEIMPORTRESIDUE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEIMPORTRESIDUE]->label = 'Import Residue';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEIMPORTRESIDUE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::SENSEIMPORTRESIDUE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::STATUS] = new LexiconOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::STATUS);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::STATUS]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::STATUS]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::STATUS]->hideIfEmpty = true;

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::REFERENCE] = new LexiconMultitextConfigObj();
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::REFERENCE]->label = 'Reference';
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::REFERENCE]->hideIfEmpty = true;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::REFERENCE]->inputSystems[] = 'en';

        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLEPUBLISHIN] = new LexiconMultiOptionlistConfigObj();
        $listCode = LexiconConfigObj::flexOptionlistCode(LexiconConfigObj::EXAMPLEPUBLISHIN);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLEPUBLISHIN]->label = LexiconConfigObj::flexOptionlistName($listCode);
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLEPUBLISHIN]->listCode = $listCode;
        $this->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLEPUBLISHIN]->hideIfEmpty = true;

        // default role views values
        $this->roleViews[LexiconRoles::OBSERVER] = new LexRoleViewConfig();
        $this->roleViews[LexiconRoles::OBSERVER_WITH_COMMENT] = new LexRoleViewConfig();
        $this->roleViews[LexiconRoles::CONTRIBUTOR] = new LexRoleViewConfig();
        $this->roleViews[LexiconRoles::MANAGER] = new LexRoleViewConfig();

        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::LEXEME] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::DEFINITION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::POS] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SEMDOM] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::EXAMPLE_SENTENCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION] = new LexViewMultiTextFieldConfig(true);

        // Less common fields are visible by default
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::GLOSS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::PICTURES] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::CITATIONFORM] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ENVIRONMENTS] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::PRONUNCIATION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::CVPATTERN] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::TONE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::LOCATION] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ETYMOLOGY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ETYMOLOGYGLOSS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ETYMOLOGYCOMMENT] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ETYMOLOGYSOURCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::NOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::LITERALMEANING] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ENTRYBIBLIOGRAPHY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ENTRYRESTRICTIONS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SUMMARYDEFINITION] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ENTRYIMPORTRESIDUE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SCIENTIFICNAME] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ANTHROPOLOGYNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SENSEBIBLIOGRAPHY] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::DISCOURSENOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ENCYCLOPEDICNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::GENERALNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::GRAMMARNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::PHONOLOGYNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SENSERESTRCTIONS] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SEMANTICSNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SOCIOLINGUISTICSNOTE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SOURCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::USAGES] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::REVERSALENTRIES] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SENSETYPE] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ACADEMICDOMAINS] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SENSEPUBLISHIN] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::ANTHROPOLOGYCATEGORIES] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::SENSEIMPORTRESIDUE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::STATUS] = new LexViewFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::REFERENCE] = new LexViewMultiTextFieldConfig(true);
        $this->roleViews[LexiconRoles::OBSERVER]->fields[LexiconConfigObj::EXAMPLEPUBLISHIN] = new LexViewFieldConfig(true);

        $this->roleViews[LexiconRoles::OBSERVER_WITH_COMMENT]->fields = clone $this->roleViews[LexiconRoles::OBSERVER]->fields;
        $this->roleViews[LexiconRoles::CONTRIBUTOR]->fields = clone $this->roleViews[LexiconRoles::OBSERVER]->fields;
        $this->roleViews[LexiconRoles::MANAGER]->fields = clone $this->roleViews[LexiconRoles::OBSERVER]->fields;

        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::VIEW] = true;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::DASHBOARD] = true;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::GATHERTEXTS] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::SEMDOM] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::WORDLIST] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::DBE] = true;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::ADDMEANINGS] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::ADDGRAMMAR] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::ADDEXAMPLES] = false;
        $this->roleViews[LexiconRoles::OBSERVER]->showTasks[LexiconTask::REVIEW] = false;

        $this->roleViews[LexiconRoles::OBSERVER_WITH_COMMENT]->showTasks = clone $this->roleViews[LexiconRoles::OBSERVER]->showTasks;

        $this->roleViews[LexiconRoles::CONTRIBUTOR]->showTasks = clone $this->roleViews[LexiconRoles::OBSERVER]->showTasks;
        $this->roleViews[LexiconRoles::CONTRIBUTOR]->showTasks[LexiconTask::ADDMEANINGS] = true;
        $this->roleViews[LexiconRoles::CONTRIBUTOR]->showTasks[LexiconTask::ADDGRAMMAR] = true;
        $this->roleViews[LexiconRoles::CONTRIBUTOR]->showTasks[LexiconTask::ADDEXAMPLES] = true;

        $this->roleViews[LexiconRoles::MANAGER]->showTasks = clone $this->roleViews[LexiconRoles::CONTRIBUTOR]->showTasks;
        $this->roleViews[LexiconRoles::MANAGER]->showTasks[LexiconTask::GATHERTEXTS] = true;
        $this->roleViews[LexiconRoles::MANAGER]->showTasks[LexiconTask::SEMDOM] = true;
        $this->roleViews[LexiconRoles::MANAGER]->showTasks[LexiconTask::WORDLIST] = true;
        $this->roleViews[LexiconRoles::MANAGER]->showTasks[LexiconTask::REVIEW] = true;

    }
}
