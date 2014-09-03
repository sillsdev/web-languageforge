<?php
namespace models\shared\dto;

use models\mapper\Id;
use models\mapper\JsonEncoder;

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
