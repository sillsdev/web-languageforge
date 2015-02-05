<?php
namespace models\shared\commands;

class UploadResponse
{

    /**
     *
     * @var boolean
     */
    public $result;

    /**
     *
     * @var ImportResult|MediaResult|ErrorResult
     */
    public $data;
}

?>
