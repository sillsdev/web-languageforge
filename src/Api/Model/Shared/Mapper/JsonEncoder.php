<?php

namespace Api\Model\Shared\Mapper;

use Litipk\Jiffy\UniversalTimestamp;
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
     * @throws \Exception
     */
    protected function _encode($model)
    {
        $data = array();
        $privateProperties = array();
        if (method_exists($model, 'getPrivateProperties')) {
            $privateProperties = (array) $model->getPrivateProperties();
        }

        foreach ($model as $key => $value) {
            if (in_array($key, $privateProperties)) {
                continue;
            }
            if (is_a($value, 'Api\Model\Shared\Mapper\IdReference')) {
                $data[$key] = $this->encodeIdReference($key, $model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\Id')) {
                $data[$key] = $this->encodeId($key, $model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\ArrayOf')) {
                $data[$key] = $this->encodeArrayOf($key, $model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\MapOf')) {
                $data[$key] = $this->encodeMapOf($key, $model->{$key});
            } elseif (is_a($value, 'DateTime')) {
                $data[$key] = $this->encodeDateTime($model->{$key});
            } elseif (is_a($value, 'Litipk\Jiffy\UniversalTimestamp')) {
                $data[$key] = $this->encodeUniversalTimestamp($model->{$key});
            } elseif (is_a($value, 'Api\Model\Shared\Mapper\ReferenceList')) {
                $data[$key] = $this->encodeReferenceList($key, $model->{$key});
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
    public function encodeIdReference(
        /** @noinspection PhpUnusedParameterInspection $key may be used in derived methods */
        &$key, $model)
    {
        $result = $model->id;

        return $result;
    }

    /**
     * @param string $key
     * @param Id $model
     * @return string
     */
    public function encodeId(
        /** @noinspection PhpUnusedParameterInspection $key may be used in derived methods */
        $key, $model)
    {
        $result = $model->id;

        return $result;
    }

    /**
     * @param string $key
     * @param ArrayOf $model
     * @return array
     * @throws \Exception
     */
    public function encodeArrayOf(
        /** @noinspection PhpUnusedParameterInspection $key may be used in derived methods */
        $key, $model)
    {
        // Note: $key may be used in derived methods
        $result = array();
        foreach ($model as $item) {
            if (is_object($item)) {
                $result[] = $this->_encode($item);
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
     * @param string $key
     * @param MapOf $model
     * @return array|\stdClass
     * @throws \Exception
     */
    public function encodeMapOf(
        /** @noinspection PhpUnusedParameterInspection $key may be used in derived methods */
        $key, $model)
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
    public function encodeReferenceList(
        /** @noinspection PhpUnusedParameterInspection $key may be used in derived methods */
        $key, $model)
    {
        // Note: $key may be used in derived methods
        $result = array_map(
            function ($id) {
                CodeGuard::checkTypeAndThrow($id, 'Api\Model\Shared\Mapper\Id');

                return $id->id;
            },
            $model->refs
        );

        return $result;
    }

    /**
     * @param \DateTime $model
     * @return string;
     */
    public function encodeDateTime($model)
    {
        // Can't use DateTime::ISO8601 here since it returns timezones like "+0700" (format code "O") and we need "+07:00" (format code "P")
        // But format code "c" returns a proper RFC 3339 date (2012-12-25T12:34:56+00:00) which will be parsed by every browser
        return $model->format('c');
    }

    /**
     * @param UniversalTimestamp $model
     * @return string;
     */
    public function encodeUniversalTimestamp($model)
    {
        // Unfortunately, UniversalTimestamp::ISO8601_WITH_MILLISECONDS returns timezones like "+0700" (format code "O") and we need "+07:00" (format code "P")
        $dt = $model->asDateTimeInterface();
        return $model->asFormattedString(UniversalTimestamp::ISO8601_WITH_MILLISECONDS_WITHOUT_TZ) . $dt->format('P');
    }

}
