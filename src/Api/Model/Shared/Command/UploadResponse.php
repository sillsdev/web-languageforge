<?php

namespace Api\Model\Shared\Command;

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
