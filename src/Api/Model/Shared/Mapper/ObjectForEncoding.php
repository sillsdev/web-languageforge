<?php

namespace Api\Model\Shared\Mapper;

class ObjectForEncoding
{
    /** @var array */
    private $_privateProperties;

    /** @var array */
    private $_readOnlyProperties;

    /** @var array */
    protected $_sensitiveProperties;  // E.g., "senses" for a LexEntry, and "pictures" or "examples" for a LexSense
    // TODO: would a name like "guidKeyedProperties" be better? - 2018-07-13 RM

    protected function setReadOnlyProp($propertyName)
    {
        if (!is_array($this->_readOnlyProperties)) {
            $this->_readOnlyProperties = [];
        }
        if (!in_array($propertyName, $this->_readOnlyProperties)) {
            $this->_readOnlyProperties[] = $propertyName;
        }
    }
    protected function setPrivateProp($propertyName)
    {
        if (!is_array($this->_privateProperties)) {
            $this->_privateProperties = [];
        }
        if (!in_array($propertyName, $this->_privateProperties)) {
            $this->_privateProperties[] = $propertyName;
        }
    }
    protected function setSensitiveProp($propertyName)
    {
        if (!is_array($this->_sensitiveProperties)) {
            $this->_sensitiveProperties = [];
        }
        if (!in_array($propertyName, $this->_sensitiveProperties)) {
            $this->_sensitiveProperties[] = $propertyName;
        }
    }

    public function getReadOnlyProperties()
    {
        return $this->_readOnlyProperties;
    }

    public function getPrivateProperties()
    {
        return $this->_privateProperties;
    }
    public function getSensitiveProperties()
    {
        if (!is_array($this->_sensitiveProperties)) {
            $this->_sensitiveProperties = [];
        }
        return $this->_sensitiveProperties;
    }
}
