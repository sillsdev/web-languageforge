<?php
namespace Api\Model;

class EmailSettings
{

    public function __construct()
    {
    }

    /**
     * @var string
     */
    public $fromAddress;

    /**
     * @var string
     */
    public $fromName;
}
