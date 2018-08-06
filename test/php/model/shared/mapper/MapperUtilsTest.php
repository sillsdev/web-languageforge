<?php

use Api\Model\Shared\Mapper\MapperUtils;
use PHPUnit\Framework\TestCase;

class MapperUtilsTest extends TestCase
{
    public function doit($old, $new, $expected)
    {
        $changes = MapperUtils::calculateChanges($old, $new);
        if (empty($expected)) {
            $this->assertEmpty($changes);
        } else {
            $this->assertEquals($expected['added'], $changes['added']);
            $this->assertEquals($expected['removed'], $changes['removed']);
            $this->assertEquals($expected['moved'], $changes['moved']);
        }
    }

    public function testCalculateChanges_EmptyInputs_NoChange()
    {
        $this->doit([], [], []);
    }

    public function testCalculateChanges_SameInputs_NoChange()
    {
        $this->doit(['a', 'b', 'c'], ['a', 'b', 'c'], []);
    }

    public function testCalculateChanges_FirstItemDeleted_NoMoves()
    {
        $this->doit(['a', 'b', 'c'], ['b', 'c'], ['added' => [], 'removed' => ['a'], 'moved' => []]);
    }

    public function testCalculateChanges_MiddleItemDeleted_NoMoves()
    {
        $this->doit(['a', 'b', 'c'], ['a', 'c'], ['added' => [], 'removed' => ['b'], 'moved' => []]);
    }

    public function testCalculateChanges_LastItemDeleted_NoMoves()
    {
        $this->doit(['a', 'b', 'c'], ['a', 'b'], ['added' => [], 'removed' => ['c'], 'moved' => []]);
    }

    public function testCalculateChanges_ItemAppended_NoMoves()
    {
        $this->doit(['a', 'b', 'c'], ['a', 'b', 'c', 'd'], ['added' => ['d'], 'removed' => [], 'moved' => []]);
    }

    public function testCalculateChanges_ItemAddedInFirstPosition_CreatesMoves()
    {
        $this->doit(['a', 'b', 'c'], ['d', 'a', 'b', 'c'], ['added' => ['d'], 'removed' => [], 'moved' => [0 => 1, 1 => 2, 2 => 3, 3 => 0]]);
    }

    public function testCalculateChanges_ItemAddedInSecondPosition_CreatesMoves()
    {
        $this->doit(['a', 'b', 'c'], ['a', 'd', 'b', 'c'], ['added' => ['d'], 'removed' => [], 'moved' => [0 => 0, 1 => 2, 2 => 3, 3 => 1]]);
    }

    public function testCalculateChanges_LotsOfChanges_RightOutput()
    {
        $this->doit(['a', 'b', 'c'], ['b', 'd', 'a'], ['added' => ['d'], 'removed' => ['c'], 'moved' => [0 => 2, 1 => 0, 2 => 1]]);
    }
}
