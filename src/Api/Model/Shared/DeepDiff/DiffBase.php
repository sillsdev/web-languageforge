<?php

namespace Api\Model\Shared\DeepDiff;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class DiffBase
{
    /** @var callable The function <object> function($data = null) returns an instance of the object. */
    private $_generator;

    /** @var char */
    public $kind;

    /** @var array */
    public $path;

    public function toMongoPath() {
        return join('.', $this->path);
    }

    public function toMongoUpdateEntry() {}

    public function getValue() {}

    public static function fromDeepDiff($deepDiff) {
        $kind = $deepDiff['kind'];
        switch ($kind) {
            case 'N': return new AddedDiff($deepDiff);
            case 'D': return new DeletedDiff($deepDiff);
            case 'E': return new EditedDiff($deepDiff);
            case 'A': return new ArrayDiff($deepDiff);
            default: return null;
        }
    }
}
