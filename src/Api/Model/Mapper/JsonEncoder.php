<?php

namespace Api\Model\Mapper;

use Palaso\Utilities\CodeGuard;

class JsonEncoder
{
    /**
     * Sets key/values in the array from the public properties of $model
     * @param object $model
     * @return array
     */
    public static function encode($model)
    {
        $encoder = new JsonEncoder();

        return $encoder->_encode($model);
    }

    /**
     * Sets key/values in the array from the public properties of $model
     * @param object $model
     * @return array
     */
    protected function _encode($model)
    {
        $data = array();
        $properties = get_object_vars($model);
        $privateProperties = array();
        if (method_exists($model, 'getPrivateProperties')) {
            $privateProperties = (array) $model->getPrivateProperties();
        }

        foreach ($properties as $key => $value) {
            if (in_array($key, $privateProperties)) {
                continue;
            }
            if (is_a($value, 'Api\Model\Mapper\IdReference')) {
                $data[$key] = $this->encodeIdReference($key, $model->$key);
            } elseif (is_a($value, 'Api\Model\Mapper\Id')) {
                $data[$key] = $this->encodeId($key, $model->$key);
            } elseif (is_a($value, 'Api\Model\Mapper\ArrayOf')) {
                $data[$key] = $this->encodeArrayOf($key, $model->$key);
            } elseif (is_a($value, 'Api\Model\Mapper\MapOf')) {
                $data[$key] = $this->encodeMapOf($key, $model->$key);
            } elseif (is_a($value, 'DateTime')) {
                $data[$key] = $this->encodeDateTime($key, $model->$key);
            } elseif (is_a($value, 'Api\Model\Mapper\ReferenceList')) {
                $data[$key] = $this->encodeReferenceList($key, $model->$key);
            } else {
                // Data type protection
                if (is_array($value)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "->" . $key . "'");
                }
                // Special hack to help debugging our app
                if ($key == 'projects' || $key == 'users') {
                    throw new \Exception("Possible bad write of '$key'\n" . var_export($model, true));
                }
                if (is_object($value)) {
                    $data[$key] = $this->_encode($value);
                } else {
                    // Default encode
                    if (is_null($value)) {
                        $value = '';
                    }
                    $data[$key] = $value;
                }
            }
        }

        return $data;
    }

    /**
     * @param string $key
     * @param IdReference $model
     * @return string
     */
    public function encodeIdReference($key, $model)
    {
        // Note: $key may be used in derived methods
        $result = $model->id;

        return $result;
    }

    /**
     * @param string $key
     * @param Id $model
     * @return string
     */
    public function encodeId($key, $model)
    {
        // Note: $key may be used in derived methods
        $result = $model->id;

        return $result;
    }

    /**
     * @param string $key
     * @param ArrayOf $model
     * @return array
     * @throws \Exception
     */
    public function encodeArrayOf($key, $model)
    {
        // Note: $key may be used in derived methods
        $result = array();
        foreach ($model as $item) {
            if (is_object($item)) {
                $result[] = $this->_encode($item);
            } else {
                // Data type protection
                if (is_array($item)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "->" . $key . "'");
                }
                // Default encode
                $result[] = $item;
            }
        }

        return $result;
    }

    /**
     * @param string $key
     * @param MapOf $model
     * @return array
     * @throws \Exception
     */
    public function encodeMapOf($key, $model)
    {
        $result = array();
        $count = 0;
        foreach ($model as $itemKey => $item) {
            if (is_object($item)) {
                $result[$itemKey] = $this->_encode($item);
            } else {
                // Data type protection
                if (is_array($item)) {
                    throw new \Exception("Must not encode array in '" . get_class($model) . "->" . $itemKey . "'");
                }
                // Default encode
                $result[$itemKey] = $item;
            }
            $count++;
        }
        // Note: we return stdClass to represent an empty JSON object (as opposed to an empty JSON array)
        return $count == 0 ? new \stdClass() : $result;
    }

    /**
     * @param string $key
     * @param ReferenceList $model
     * @return array
     */
    public function encodeReferenceList($key, $model)
    {
        // Note: $key may be used in derived methods
        $result = array_map(
            function ($id) {
                CodeGuard::checkTypeAndThrow($id, 'Api\Model\Mapper\Id');

                return $id->id;
            },
            $model->refs
        );

        return $result;
    }

    /**
     * @param string $key
     * @param DateTime $model
     * @return string;
     */
    public function encodeDateTime($key, $model)
    {
        return $model->format(\DateTime::ISO8601);
    }

}
