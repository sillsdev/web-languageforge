<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexTaskDashboard extends LexTask
{
    public function __construct()
    {
        $this->type = LexTask::DASHBOARD;
        parent::__construct();
    }

    /**
     * Number of days to view the data
     * @var int
     */
    public $timeSpanDays;

    public $targetWordCount;
}
