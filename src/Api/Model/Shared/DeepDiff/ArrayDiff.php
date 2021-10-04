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

    public function __construct(Array $diff) {
        $this->kind = 'A';
        $this->path = $diff['path'];
        $this->idx = $diff['index'];
        $this->item = $diff['item'];
    }

    public function getValue() {
        return $this->item['rhs'];
    }

    public function toMongoUpdateEntry() {
        $path = $this->toMongoPath();
        $kind = $item['kind'];
        if ($kind == 'N') {
            // Pushes should happen in low-to-high index order, and it's the calling function's responsibility to ensure that this has been arranged
            $newData = $item['rhs'];
            return [ '$push' => [ $path => $this->newData ] ];
        }
        if ($kind == 'D') {
            // Pops should happen in high-to-low index order, which is what deep-diff already returns
            return [ '$pop' => [ $path => 1 ] ];
        }
        // ArrayDiffs cannot contain anything other than Added or Deleted, so if they do, it's invalid and we omit it
        // But first log it for later analysis
        error_log('ArrayDiff contained item with kind other than A or D: ' . print_r($this->item, true));
        return [];
    }
}
