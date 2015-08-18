<?php
namespace Api\Model\Shared\Dto;

use Api\Model\Mapper\Id;
use Api\Model\Mapper\JsonEncoder;

class CreateSimpleDto
{
    /**
     * @param string $id
     * @param string $password
     */
    public function __construct($id, $password)
    {
        $this->id = new Id($id);
        $this->password = $password;
    }

    public function encode()
    {
        return JsonEncoder::encode($this);
    }

    /**
     * @var Id
     */
    public $id;

    /**
     * @var string
     */
    public $password;

}
