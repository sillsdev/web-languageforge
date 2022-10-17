<?php

namespace Api\Model\Shared\Mapper;

use Litipk\Jiffy\UniversalTimestamp;
use MongoDB\BSON\UTCDateTime;
use Palaso\Utilities\CodeGuard;

class MongoDecoder extends JsonDecoder
{
    protected function postDecode($model)
    {
        if (method_exists($model, "fixDecode")) {
            $model->fixDecode();
        }
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     * @param string $id
     * @throws \Exception
     */
    public static function decode($model, $values, $id = "")
    {
        $decoder = new MongoDecoder();
        $decoder->_decode($model, $values, $id);
    }

    /**
     * @param string $key
     * @param object $model
     * @param array $values
     */
    public function decodeIdReference($key, $model, $values)
    {
        $model->$key->id = (string) $values[$key];
    }

    /**
     * @param string $key
     * @param object $model
     * @param array $values
     * @param string $id
     * @throws \Exception
     */
    public function decodeId($key, $model, $values, $id)
    {
        if (!empty($id)) {
            CodeGuard::checkTypeAndThrow($id, "string");
            $model->$key->id = $id;
        } elseif (!empty($values[$key])) {
            CodeGuard::checkTypeAndThrow($values[$key], "string");
            $model->$key->id = $values[$key];
        } else {
            throw new \Exception("The id could not be decoded. Value not set in 'values' or 'id' for key '$key'");
        }
    }

    /**
     * Decodes the mongo array into the ReferenceList $model
     * @param ReferenceList $model
     * @param array $data
     * @throws \Exception
     */
    public function decodeReferenceList($model, $data)
    {
        $model->refs = [];
        if (array_key_exists("refs", $data)) {
            // This likely came from an API client, who shouldn't be sending this.
            return;
        }
        $refsArray = $data;
        foreach ($refsArray as $objectId) {
            if (!is_a($objectId, "MongoDB\BSON\ObjectID")) {
                throw new \Exception(
                    "Invalid type '" . gettype($objectId) . " : " . get_class($objectId) . "' in ref collection"
                );
            }
            array_push($model->refs, new Id((string) $objectId));
        }
    }

    /**
     * @param \DateTime $model
     * @param UTCDateTime $data
     */
    public function decodeDateTime(&$model, $data)
    {
        CodeGuard::checkTypeAndThrow($data, "MongoDB\BSON\UTCDateTime", CodeGuard::CHECK_NULL_OK);
        /** @var UTCDateTime $data */
        if ($data !== null) {
            /** @var \DateTime $newDateTime */
            $newDateTime = $data->toDateTime();
            $model->setTimestamp($newDateTime->getTimestamp());
        }
    }

    /**
     * @param UniversalTimestamp $model
     * @param UTCDateTime $data
     */
    public function decodeUniversalTimestamp(&$model, $data)
    {
        CodeGuard::checkTypeAndThrow($data, "MongoDB\BSON\UTCDateTime", CodeGuard::CHECK_NULL_OK);
        // account for difference between .NET and Linux epoch
        // (which produces negative milliseconds in UTCDateTime then causes an exception in UniversalTimestamp)
        if ((int) (string) $data < 0) {
            $data = new UTCDateTime(0);
        }
        parent::decodeUniversalTimestamp($model, $data);
    }

    /**
     * Mongo can't handle '.' or '$' on array keys.
     * Replace '___DOLLAR___' with '$'
     * Replace '___DOT___' with '.'
     * @param string $key
     * @param array $data
     */
    public function decodeDollarDot($key, &$data)
    {
        if (strpos($key, "___DOLLAR___") > -1) {
            $newK = str_replace("___DOLLAR___", '$', $key);
            $data[$newK] = $data[$key];
            unset($data[$key]);
        }
        if (strpos($key, "___DOT___") > -1) {
            $newK = str_replace("___DOT___", ".", $key);
            $data[$newK] = $data[$key];
            unset($data[$key]);
        }
    }

    /**
     * @param string $key
     * @param MapOf $model
     * @param array $data
     * @throws \Exception
     */
    public function decodeMapOf($key, $model, $data)
    {
        foreach ($data as $k => $item) {
            self::decodeDollarDot($k, $data);
        }
        parent::decodeMapOf($key, $model, $data);
    }
}
