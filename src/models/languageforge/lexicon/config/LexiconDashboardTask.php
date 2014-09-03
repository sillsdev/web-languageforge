<?php

namespace models\languageforge\lexicon\config;

class LexiconDashboardTask extends LexiconTask
{
    public function __construct()
    {
        $this->type = LexiconTask::DASHBOARD;
        parent::__construct();
    }

    /**
     * Number of days to view the data
     * @var int
     */
    public $timeSpanDays;

    public $targetWordCount;

}
