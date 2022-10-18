<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class ArrayDiff extends DiffBase
{
    /** @var integer */
    public $idx;

    /** @var Array */
    public $item;

    public function __construct(array $diff)
    {
        $this->kind = "A";
        $this->path = $diff["path"];
        $this->idx = $diff["index"];
        $this->item = $diff["item"];
    }

    public function getValue()
    {
        return $this->item["rhs"];
    }
}
