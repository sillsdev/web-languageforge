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

    public function toMongoUpdateEntry() {
        $path = $this->toMongoPath();
        return [ '$set' => [ $path => $this->newData ] ];
    }

    public function getValue() {
        return $this->newData;
    }

    public function toActivityLogDifference() {
        // TODO: Implement. Probably look for '.ws.value' at end of path, or rather ['ws', 'value'], and strip off the "value" part.
        // But combining the various parts of the path might be a bit trickier...
    }
}

/* LexMultiText differences:
            $result[] = [
                "inputSystem" => $key,
                "this" => $thisValue,
                "other" => $otherValue
            ];
*/
