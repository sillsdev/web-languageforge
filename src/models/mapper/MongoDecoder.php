<?php
namespace models\mapper;

use Palaso\Utilities\CodeGuard;

class MongoDecoder extends JsonDecoder
{
    protected function postDecode($model)
    {
        if (method_exists($model, 'fixDecode')) {
            $model->fixDecode();
        }
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     */
    public static function decode($model, $values, $id = '')
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
            CodeGuard::checkTypeAndThrow($id, 'string');
            $model->$key->id = $id;
        } elseif (!empty($values[$key])) {
            CodeGuard::checkTypeAndThrow($values[$key], 'string');
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
        $model->refs = array();
        if (array_key_exists('refs', $data)) {
            // This likely came from an API client, who shouldn't be sending this.
            return;
        }
        $refsArray = $data;
        foreach ($refsArray as $objectId) {
            if (!is_a($objectId, 'MongoId')) {
                throw new \Exception(
                        "Invalid type '" . gettype($objectId) . "' in ref collection"
                );
            }
            array_push($model->refs, new Id((string) $objectId));
        }
    }

    /**
     * @param string $key
     * @param object $model
     * @param MongoDate $data
     */
    public function decodeDateTime($key, $model, $data)
    {
        CodeGuard::checkTypeAndThrow($data, 'MongoDate', CodeGuard::CHECK_NULL_OK);
        if ($data !== null) {
            $model->setTimeStamp($data->sec);
        }
    }

    /**
     * Mongo can't handle '.' or '$' on array keys.
     * Replace '___DOLLAR___' with '$'
     * Replace '___DOT___' with '.'
     * @param string $key
     * @param MongoDate $data
     */
    public function decodeDollarDot($key, &$data)
    {
        if (strpos($key, '___DOLLAR___') > -1) {
            $newK = str_replace('___DOLLAR___', '$', $key);
            $data[$newK] = $data[$key];
            unset($data[$key]);
        }
        if (strpos($key, '___DOT___') > -1) {
            $newK = str_replace('___DOT___', '.', $key);
            $data[$newK] = $data[$key];
            unset($data[$key]);
        }
    }

    /**
     * @param string $key
     * @param object $model
     * @param MongoDate $data
     */
    public function decodeMapOf($key, $model, $data)
    {
        foreach ($data as $k => $item) {
            self::decodeDollarDot($k, $data);
        }
        parent::decodeMapOf($key, $model, $data);
    }

}
