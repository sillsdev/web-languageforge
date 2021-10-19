<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class DeletedDiff extends DiffBase
{
    /** @var mixed */
    public $oldData;

    public function __construct(Array $diff) {
        $this->kind = 'D';
        $this->path = $diff['path'];
        $this->oldData = $diff['lhs'];
    }

    public function getValue() {
        return null;
    }
}
