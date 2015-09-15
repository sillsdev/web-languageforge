<?php

namespace Api\Model\Shared\Command;

class ImportResult
{

    /**
     *
     * @var string
     */
    public $path;

    /**
     *
     * @var string
     */
    public $fileName;

    /**
     *
     * @var LiftImportStats
     */
    public $stats;

    /**
     *
     * @var string
     */
    public $importErrors;

}
