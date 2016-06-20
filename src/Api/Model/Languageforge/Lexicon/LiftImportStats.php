<?php

namespace Api\Model\Languageforge\Lexicon;

class LiftImportStats
{

    public function __construct($existingEntries = 0)
    {
        $this->existingEntries = $existingEntries;
        $this->importEntries = 0;
        $this->newEntries = 0;
        $this->entriesMerged = 0;
        $this->entriesDuplicated = 0;
        $this->entriesDeleted = 0;
    }

    /**
     *
     * @var integer
     */
    public $existingEntries;

    /**
     *
     * @var integer
     */
    public $importEntries;

    /**
     *
     * @var integer
     */
    public $newEntries;

    /**
     *
     * @var integer
     */
    public $entriesMerged;

    /**
     *
     * @var integer
     */
    public $entriesDuplicated;

    /**
     *
     * @var integer
     */
    public $entriesDeleted;
}
