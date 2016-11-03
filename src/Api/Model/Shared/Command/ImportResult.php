<?php

namespace Api\Model\Shared\Command;

use Api\Model\Languageforge\Lexicon\LiftImportStats;

class ImportResult
{
    /** @var string */
    public $path;

    /** @var string */
    public $fileName;

    /** @var LiftImportStats */
    public $stats;

    /** @var string */
    public $importErrors;
}
