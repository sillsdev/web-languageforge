<?php

use Api\Library\Shared\Palaso\InternationalUtility;
use PHPUnit\Framework\TestCase;

class InternationalUtilityTest extends TestCase
{
    public function testArrayNormalize_ArrayOfString_Normalized()
    {
        $expectedArray = ['This name "tårta" is NFC', ["nested array element"]];
        $actualArray = ['This name "tårta" is NFD', ["nested array element"]];
        $actualArrayNormalized = InternationalUtility::arrayNormalize($actualArray);
        $actualArrayNormalized[0] = substr($actualArrayNormalized[0], 0, -1) . "C";

        $this->assertTrue(Normalizer::isNormalized($expectedArray[0], Normalizer::FORM_C));
        $this->assertTrue(Normalizer::isNormalized($actualArray[0], Normalizer::FORM_D));
        $this->assertTrue(Normalizer::isNormalized($actualArrayNormalized[0], Normalizer::FORM_C));
        $this->assertNotEquals($expectedArray, $actualArray);
        $this->assertEquals($expectedArray, $actualArrayNormalized);
    }
}
