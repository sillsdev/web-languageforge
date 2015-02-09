<?php
namespace models\shared\commands;

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

?>
