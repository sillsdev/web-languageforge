<?php

namespace Api\Model\Shared\Mapper;

use Litipk\Jiffy\UniversalTimestamp;
use MongoDB\BSON\UTCDateTime;
use Palaso\Utilities\CodeGuard;

class MongoEncoder
{
    /**
     * Sets key/values in the array from the public properties of $model
     * @param object $model
     * @return array
     */
    public static function encode($model)
    {
        $encoder = new MongoEncoder();
        return $encoder->_encode($model);
    }

    /**
     * Sets key/values in the array from the public properties of $model
     * @param object $model
     * @param boolean $encodeId
     * @return array
     * @throws \Exception
     */
    protected function _encode($model, $encodeId = false)
    {
        $data = array();
        $properties = get_object_vars($model);
        foreach ($properties as $key => $value) {
            if (is_a($value, 'Api\Model\Shared\Mapper\ArrayOf')) {
                $data[$key] = $this->encodeArrayOf($model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\MapOf')) {
                $data[$key] = $this->encodeMapOf($model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\IdReference')) {
                $data[$key] = $this->encodeIdReference($model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\Id')) {
                if ($encodeId) {
                    $data[$key] = $this->encodeId($model->{$key});
                }
            } elseif (is_a($value, 'DateTime')) {
                $data[$key] = $this->encodeDateTime($model->{$key});
            } elseif (is_a($value, 'Litipk\Jiffy\UniversalTimestamp')) {
                $data[$key] = $this->encodeUniversalTimestamp($model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\ReferenceList')) {
                $data[$key] = $this->encodeReferenceList($model->{$key});
            } else {
                // Data type protection
                if (is_array($value)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "->" . $key . "'");
                }
                if (is_object($value)) {
                    $data[$key] = $this->_encode($value, true);
                } else {
                    // Default encode
                    $data[$key] = $value;
                }
            }
        }
        return $data;
    }

    /**
     * @param IdReference $model
     * @return string
     */
    public function encodeIdReference($model)
    {
        if (Id::isEmpty($model)) {
            return null;
        }
        $mongoId = MongoMapper::mongoID($model->id);
        return $mongoId;
    }

    /**
     * @param Id $model
     * @return string
     */
    public function encodeId($model)
    {
        $mongoId = MongoMapper::mongoID($model->id);
        if (empty($model->id)) {
            $model->id = (string) $mongoId;
        }
        return $mongoId;
    }

    /**
     * @param ArrayOf $model
     * @return array
     * @throws \Exception
     */
    public function encodeArrayOf($model)
    {
        $result = array();
        foreach ($model as $item) {
            if (is_object($item)) {
                $result[] = $this->_encode($item, true);
            } else {
                // Data type protection
                if (is_array($item)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "'");
                }
                // Default encode
                $result[] = $item;
            }
        }
        return $result;
    }

    /**
     * Mongo can't handle '$' or '.' on array keys.
     * Replace '$' with '___DOLLAR___'
     * Replace '.' with '___DOT___'
     * @param string $key
     */
    public static function encodeDollarDot(&$key)
    {
        if (strpos($key, '$') > -1) {
            $key = str_replace('$', '___DOLLAR___', $key);
        }
        if (strpos($key, '.') > -1) {
            $key = str_replace('.', '___DOT___', $key);
        }
    }

    /**
     * @param MapOf $model
     * @return array|\stdClass
     * @throws \Exception
     */
    public function encodeMapOf($model)
    {
        $result = array();
        $count = 0;
        foreach ($model as $key => $item) {
            self::encodeDollarDot($key);

            if (is_object($item)) {
                $result[$key] = $this->_encode($item, false);
            } else {
                // Data type protection
                if (is_array($item)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "->" . $key . "'");
                }
                // Default encode
                $result[$key] = $item;
            }
            $count++;
        }
        return $count == 0 ? new \stdClass() : $result;
    }

    /**
     * @param ReferenceList $model
     * @return array
     */
    public function encodeReferenceList($model)
    {
        $result = array_map(
            function ($id) {
                CodeGuard::checkTypeAndThrow($id, 'Api\Model\Shared\Mapper\Id');
                /** @var Id $id */
                return MongoMapper::mongoID($id->asString());
            },
            $model->refs
        );
        return $result;
    }

    /**
     * @param \DateTime $model
     * @return UTCDateTime;
     */
    public function encodeDateTime($model)
    {
        return new UTCDateTime(1000*$model->getTimestamp());
    }

    /**
     * @param UniversalTimestamp $model
     * @return UTCDateTime;
     */
    public function encodeUniversalTimestamp($model)
    {
        return new UTCDateTime($model->asMilliseconds());
    }
}
