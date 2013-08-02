<?php
namespace models\mapper;

use libraries\palaso\CodeGuard;

class JsonDecoder {
	
	/**
	 * @param array $array
`	 * @return bool
	 */
	public static function is_assoc($array) {
		return (bool)count(array_filter(array_keys($array), 'is_string'));
	}
	
	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $values A mixed array of JSON (like) data.
	 */
	public static function decode($model, $values) {
		$decoder = new JsonDecoder();
		$decoder->_decode($model, $values);
	}
	
	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $values A mixed array of JSON (like) data.
	 * @param bool $isRootDocument true if this is the root document, false if a sub-document. Defaults to true
	 */
	protected function _decode($model, $values, $isRootDocument = true) {
		$properties = get_object_vars($model);
		foreach ($properties as $key => $value) {
			if (is_a($value, 'models\mapper\IdReference')) {
				$this->decodeIdReference($key, $model, $values);
			} else if (is_a($value, 'models\mapper\Id')) {
				$this->decodeId($key, $model, $values, $isRootDocument);
			} else if (is_a($value, 'models\mapper\ArrayOf')) {
				if (array_key_exists($key, $values)) {
					$this->decodeArrayOf($model->$key, $values[$key]);
				}
			} else if (is_a($value, 'models\mapper\MapOf')) {
				if (array_key_exists($key, $values)) {
					$this->decodeArrayOf($model->$key, $values[$key]);
				}
			} else if (is_a($value, 'models\mapper\ReferenceList')) {
				if (array_key_exists($key, $values)) {
					$this->decodeReferenceList($model->$key, $values[$key]);
				}
			} else if (is_object($value)) {
				if (array_key_exists($key, $values)) {
					$this->_decode($model->$key, $values[$key]);
				}
			} else {
				if (!array_key_exists($key, $values)) {
					// oops // TODO Add to list, throw at end CP 2013-06
					continue;
				}
				if (is_array($values[$key])) {
					throw new \Exception("Must not decode array in '" . get_class($model) . "->" . $key . "'");
				}
				$model->$key = $values[$key];
			}
		}
	}

	/**
	 * @param string $key
	 * @param object $model
	 * @param array $values
	 */
	public function decodeIdReference($key, $model, $values) {
		$model->$key = new Id($values[$key]);
	}
	
	/**
	 * @param string $key
	 * @param object $model
	 * @param array $values
	 * @param bool $isRootDocument
	 */
	public function decodeId($key, $model, $values, $isRootDocument) {
		$model->$key = new Id($values[$key]);
	}
	
	/**
	 * @param ArrayOf $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeArrayOf($model, $data) {
		CodeGuard::checkTypeAndThrow($data, 'array');
		$model->data = array();
		foreach ($data as $item) {
			if ($model->getType() == ArrayOf::OBJECT) {
				$object = $model->generate($item);
				$this->_decode($object, $item, false);
				$model->data[] = $object;
			} else if ($model->getType() == ArrayOf::VALUE) {
				if (is_array($item)) {
					throw new \Exception("Must not decode array for value type");
				}
				$model->data[] = $item;
			}
		}
	}
	
	/**
	 * @param MapOf $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeMapOf($model, $data) {
		CodeGuard::checkTypeAndThrow($data, 'array');
		$model->data = array();
		foreach ($data as $itemKey => $item) {
			if ($model->hasGenerator()) {
				$object = $model->generate($item);
				$this->_decode($object, $item, false);
				$model->data[$itemKey] = $object;
			} else {
				if (is_array($item)) {
					throw new \Exception("Must not decode array for value type");
				}
				$model->data[$itemKey] = $item;
			}
		}
	}
	
	/**
	 * Decodes the mongo array into the ReferenceList $model
	 * @param ReferenceList $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeReferenceList($model, $data) {
		$model->refs = array();
		if (array_key_exists('refs', $data)) {
			// This likely came from an API client, who shouldn't be sending this.
			return;
		}
		$refsArray = $data;
		foreach ($refsArray as $objectId) {
			if (!is_a($objectId, 'MongoId')) {
				throw new \Exception(
						"Invalid type '" . gettype($objectId) . "' in ref collection '$key'"
				);
			}
			array_push($model->refs, new Id((string)$objectId));
		}
	}
	
	
}

?>