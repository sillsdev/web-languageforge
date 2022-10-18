<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class AddedDiff extends DiffBase
{
    /** @var mixed */
    public $newData;

    public function __construct(array $diff)
    {
        $this->kind = "N";
        $this->path = $diff["path"];
        $this->newData = $diff["rhs"];
    }

    public function getValue()
    {
        return $this->newData;
    }
}
