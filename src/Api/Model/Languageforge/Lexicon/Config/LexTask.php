<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexTask
{
    // task types
    const VIEW = "view";
    const DASHBOARD = "dashboard";
    const GATHERTEXTS = "gatherTexts";
    const SEMDOM = "semdom";
    const WORDLIST = "wordlist";
    const DBE = "dbe";
    const ADDMEANINGS = "addMeanings";
    const ADDGRAMMAR = "addGrammar";
    const ADDEXAMPLES = "addExamples";
    const REVIEW = "review";
    const IMPORTEXPORT = "importExport";
    const CONFIGURATION = "configuration";

    public function __construct()
    {
        $this->visible = true;
        $this->type = "";
    }

    /** @var boolean */
    public $visible;

    /** @var string */
    public $type;
}
