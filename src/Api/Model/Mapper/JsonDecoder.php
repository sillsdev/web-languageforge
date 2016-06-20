<?php

namespace Api\Model\Mapper;

use Palaso\Utilities\CodeGuard;

class JsonDecoder
{
    /**
     * @param array $array
`     * @return bool
     */
    public static function is_assoc($array)
    {
        return (bool) count(array_filter(array_keys($array), 'is_string'));
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     * @param string $id
     */
    public static function decode($model, $values, $id = '')
    {
        $decoder = new JsonDecoder();

        $decoder->_decode($model, $values, $id);
    }

    /**
     * Sets the public properties of $model to values from $values[propertyName]
     * @param object $model
     * @param array $values A mixed array of JSON (like) data.
     * @param bool $isRootDocument true if this is the root document, false if a sub-document. Defaults to true
     */
    protected function _decode($model, $values, $id)
    {
        CodeGuard::checkTypeAndThrow($values, 'array');
        $properties = get_object_vars($model);
        $propsToIgnore = array();

        if (method_exists($model, 'getLazyProperties')) {
            $properties = array_merge($properties, $model->getLazyProperties());
        }

        if (get_class($this) == 'Api\Model\Mapper\JsonDecoder') {

            if (method_exists($model, 'getPrivateProperties')) {
                $propsToIgnore = (array) $model->getPrivateProperties();
            }
            if (method_exists($model, 'getReadOnlyProperties')) {
                $propsToIgnore = array_merge($propsToIgnore, (array) $model->getReadOnlyProperties());
            }
        }

        foreach ($properties as $key => $value) {
            if (is_a($value, 'Api\Model\Mapper\Id') && get_class($value) == 'Api\Model\Mapper\Id') {
                 $this->decodeId($key, $model, $values, $id);
                 continue;
            }
            if (!array_key_exists($key, $values) || in_array($key, $propsToIgnore)) {
                continue;
            }
            if ($value === false) {
                $value = $model->$key; // To force the lazy evaluation to create the property.
            }
            if (is_a($value, 'Api\Model\Mapper\IdReference')) {
                $this->decodeIdReference($key, $model, $values);
            } elseif (is_a($value, 'Api\Model\Mapper\ArrayOf')) {
                $this->decodeArrayOf($key, $model->$key, $values[$key]);
            } elseif (is_a($value, 'Api\Model\Mapper\MapOf')) {
                $this->decodeMapOf($key, $model->$key, $values[$key]);
            } elseif (is_a($value, 'DateTime')) {
                $this->decodeDateTime($key, $model->$key, $values[$key]);
            } elseif (is_a($value, 'Api\Model\Mapper\ReferenceList')) {
                $this->decodeReferenceList($model->$key, $values[$key]);
            } elseif (is_object($value)) {
                $this->_decode($model->$key, $values[$key], '');
            } else {
                if (is_array($values[$key])) {
                    throw new \Exception("Must not decode array in '" . get_class($model) . "->" . $key . "'");
                }
                $model->$key = $values[$key];
            }
        }
        $this->_id = null;

        // support for nested MapOf
        if (is_a($model, 'Api\Model\Mapper\MapOf')) {
            $this->decodeMapOf($id, $model, $values);
        }

        $this->postDecode($model);
    }

    protected function postDecode($model)
    {
    }

    /**
     * @param string $key
     * @param object $model
     * @param array $values
     */
    public function decodeIdReference($key, $model, $values)
    {
        $model->$key = new IdReference($values[$key]);
    }

    /**
     * @param string $key
     * @param object $model
     * @param array $values
     * @param string $id
     */
    public function decodeId($key, $model, $values, $id)
    {
        $model->$key = new Id($values[$key]);
    }

    /**
     * @param string $key
     * @param ArrayOf $model
     * @param array $data
     * @throws \Exception
     */
    public function decodeArrayOf($key, $model, $data)
    {
        if ($data == null) {
            $data = array();
        }
        CodeGuard::checkTypeAndThrow($data, 'array');
        $model->exchangeArray(array());
        foreach ($data as $item) {
            if ($model->hasGenerator()) {
                $object = $model->generate($item);
                $this->_decode($object, $item, '');
                $model[] = $object;
            } else {
                if (is_array($item)) {
                    throw new \Exception("Must not decode array for value type '$key'");
                }
                $model[] = $item;
            }
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
        if (is_null($data) || !is_array($data) && get_class($data) == 'stdClass') {
            $data = array();
        }
        CodeGuard::checkTypeAndThrow($data, 'array');
        $model->exchangeArray(array());
        foreach ($data as $itemKey => $item) {
            if ($model->hasGenerator()) {
                $object = $model->generate($item);
                $this->_decode($object, $item, $itemKey);
                $model[$itemKey] = $object;
            } else {
                if (is_array($item)) {
                    throw new \Exception("Must not decode array for value type '$key'");
                }
                $model[$itemKey] = $item;
            }
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
            CodeGuard::checkTypeAndThrow($objectId, 'string');
            array_push($model->refs, new Id((string) $objectId));
        }
    }

    /**
     * @param string $key
     * @param object $model
     * @param string $data
     */
    public function decodeDateTime($key, $model, $data)
    {
        $model = new \DateTime($data);
    }

}
