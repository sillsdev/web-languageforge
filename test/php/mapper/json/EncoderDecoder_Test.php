<?php

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\MapOf;
use Api\Model\Mapper\ObjectForEncoding;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\Mapper\JsonDecoder;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class PropertyObject extends ObjectForEncoding
{
    public function __construct()
    {
        $this->setPrivateProp('shouldBePrivate');
        $this->setReadOnlyProp('shouldBeReadOnly');
    }

    public $name;

    public $shouldBeReadOnly;

    public $shouldBePrivate;
}

class PropertyObjectInArray
{
    public function __construct()
    {
        $this->data = new ArrayOf(function() {
            return new PropertyObject();
        });
    }

    public $name;

    /**
     * @var ArrayOf ArrayOf<PropertyObject>
     */
    public $data;
}

class PropertyObjectInArray2
{
    public function __construct()
    {
        $this->data2 = new ArrayOf(function() {
            return new PropertyObjectInArray();
        });
    }

    public $name;

    /**
     * @var ArrayOf ArrayOf<PropertyObjectInArray>
     */
    public $data2;
}

class PropertyObjectInMap
{
    public function __construct()
    {
        $this->data = new MapOf(function() {
            return new PropertyObject();
        });
    }

    public $name;

    /**
     * @var MapOf MapOf<PropertyObject>
     */
    public $data;
}

class PropertyObjectInMap2
{
    public function __construct()
    {
        $this->data2 = new MapOf(function() {
            return new PropertyObjectInArray();
        });
    }

    public $name;

    /**
     * @var MapOf MapOf<PropertyObjectInArray>
     */
    public $data2;
}

class TestJsonEncoderDecoder extends UnitTestCase
{

    public function testEncode_PrivateProperties_NotVisible()
    {
        $object = new PropertyObject();
        $object->name = 'can change name';
        $object->shouldBePrivate = 'this is private';

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertFalse(array_key_exists('shouldBePrivate', $params));
        $this->assertEqual($params['name'], $object->name);

        $params['name'] = 'different name';
        $params['shouldBePrivate'] = 'hacked';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name');
        $this->assertEqual($object->shouldBePrivate, 'this is private');
    }

    public function testDecode_ReadOnlyProperties_PropertiesNotChanged()
    {
        $object = new PropertyObject();
        $object->name = 'can change name';
        $object->shouldBeReadOnly = 'cannot change this';

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertTrue(array_key_exists('shouldBeReadOnly', $params));
        $this->assertEqual($params['name'], $object->name);
        $this->assertEqual($params['shouldBeReadOnly'], $object->shouldBeReadOnly);

        $params['name'] = 'different name';
        $params['shouldBeReadOnly'] = 'changed';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name');
        $this->assertEqual($object->shouldBeReadOnly, 'cannot change this');
    }

    public function testDecode_ReadOnlyPropertiesInArray_PropertiesNotChanged()
    {
        $objectData = new PropertyObject();
        $objectData->shouldBeReadOnly = 'cannot change this';

        $object = new PropertyObjectInArray();
        $object->name = 'can change name';
        $object->data[] = $objectData;

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertTrue(array_key_exists('shouldBeReadOnly', $params['data'][0]));
        $this->assertEqual($object->data[0]->shouldBeReadOnly, $params['data'][0]['shouldBeReadOnly']);

        $params['name'] = 'different name';
        $params['data'][0]['shouldBeReadOnly'] = 'changed';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name');
        $this->assertEqual($object->data[0]->shouldBeReadOnly, 'cannot change this');
    }

    public function testDecode_ReadOnlyPropertiesInTwoArrays_PropertiesNotChanged()
    {
        $objectData = new PropertyObject();
        $objectData->name = 'can change name';
        $objectData->shouldBeReadOnly = 'cannot change this';

        $object1 = new PropertyObjectInArray();
        $object1->name = 'can change name';
        $object1->data[] = $objectData;

        $object = new PropertyObjectInArray2();
        $object->name = 'can change name';
        $object->data2[] = $object1;

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertTrue(array_key_exists('shouldBeReadOnly', $params['data2'][0]['data'][0]));
        $this->assertEqual($object->data2[0]->data[0]->shouldBeReadOnly, $params['data2'][0]['data'][0]['shouldBeReadOnly']);

        $params['name'] = 'different name2';
        $params['data2'][0]['name'] = 'different name1';
        $params['data2'][0]['data'][0]['name'] = 'different name';
        $params['data2'][0]['data'][0]['shouldBeReadOnly'] = 'changed';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name2');
        $this->assertEqual($object->data2[0]->name, 'different name1');
        $this->assertEqual($object->data2[0]->data[0]->name, 'different name');
        $this->assertEqual($object->data2[0]->data[0]->shouldBeReadOnly, 'cannot change this');
    }

    public function testDecode_ReadOnlyPropertiesInMap_PropertiesNotChanged()
    {
        $objectData = new PropertyObject();
        $objectData->shouldBeReadOnly = 'cannot change this';

        $key = 'key1';
        $object = new PropertyObjectInMap();
        $object->name = 'can change name';
        $object->data[$key] = $objectData;

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertTrue(array_key_exists('shouldBeReadOnly', $params['data'][$key]));
        $this->assertEqual($object->data[$key]->shouldBeReadOnly, $params['data'][$key]['shouldBeReadOnly']);

        $params['name'] = 'different name';
        $params['data'][$key]['shouldBeReadOnly'] = 'changed';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name');
        $this->assertEqual($object->data[$key]->shouldBeReadOnly, 'cannot change this');
    }

    public function testDecode_ReadOnlyPropertiesInTwoMaps_PropertiesNotChanged()
    {
        $objectData = new PropertyObject();
        $objectData->name = 'can change name';
        $objectData->shouldBeReadOnly = 'cannot change this';

        $key = 'key1';
        $object1 = new PropertyObjectInMap();
        $object1->name = 'can change name';
        $object1->data[$key] = $objectData;

        $object = new PropertyObjectInMap2();
        $object->name = 'can change name';
        $object->data2[$key] = $object1;

        $params = json_decode(json_encode(JsonEncoder::encode($object)), true);

        $this->assertTrue(array_key_exists('name', $params));
        $this->assertTrue(array_key_exists('shouldBeReadOnly', $params['data2'][$key]['data'][$key]));
        $this->assertEqual($object->data2[$key]->data[$key]->shouldBeReadOnly, $params['data2'][$key]['data'][$key]['shouldBeReadOnly']);

        $params['name'] = 'different name2';
        $params['data2'][$key]['name'] = 'different name1';
        $params['data2'][$key]['data'][$key]['name'] = 'different name';
        $params['data2'][$key]['data'][$key]['shouldBeReadOnly'] = 'changed';

        JsonDecoder::decode($object, $params);

        $this->assertEqual($object->name, 'different name2');
        $this->assertEqual($object->data2[$key]->name, 'different name1');
        $this->assertEqual($object->data2[$key]->data[$key]->name, 'different name');
        $this->assertEqual($object->data2[$key]->data[$key]->shouldBeReadOnly, 'cannot change this');
    }

}
