<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class EditedDiff extends DiffBase
{
    /** @var mixed */
    public $oldData;

    /** @var mixed */
    public $newData;

    public function __construct(Array $diff) {
        $this->kind = 'E';
        $this->path = $diff['path'];
        $this->oldData = $diff['lhs'];
        $this->newData = $diff['rhs'];
    }

    public function getValue() {
        return $this->newData;
    }
}
