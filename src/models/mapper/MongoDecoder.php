<?php
namespace models\mapper;

use libraries\palaso\CodeGuard;

class MongoDecoder extends JsonDecoder {
	
	protected function postDecode($model) {
		if (method_exists($model, 'fixDecode')) {
			$model->fixDecode();
		}
	}
	
	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $values A mixed array of JSON (like) data.
	 */
	public static function decode($model, $values, $id = '') {
		$decoder = new MongoDecoder();
		$decoder->_decode($model, $values, $id);
	}
	
	/**
	 * @param string $key
	 * @param object $model
	 * @param array $values
	 */
	public function decodeIdReference($key, $model, $values) {
		$model->$key->id = (string)$values[$key];
	}
	
	/**
	 * @param string $key
	 * @param object $model
	 * @param array $values
	 * @param string $id
	 * @throws \Exception
	 */
	public function decodeId($key, $model, $values, $id) {
		if (!empty($id)) {
			CodeGuard::checkTypeAndThrow($id, 'string');
			$model->$key->id = $id;
		} else if (!empty($values[$key])) {
			CodeGuard::checkTypeAndThrow($values[$key], 'string');
			$model->$key->id = $values[$key];
		} else {
			throw new \Exception("The id could not be decoded. Value not set in 'values' or 'id' for key '$key'");
		}
	}
	
	/**
	 * @param ArrayOf $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeArrayOf($key, $model, $data) {
		if (!is_array($data)) {
			throw new \Exception("Bad data when array expected. '$data'");
		}
		$model->data = array();
		foreach ($data as $item) {
			if ($model->getType() == ArrayOf::OBJECT) {
				$object = $model->generate($item);
				$this->_decode($object, $item, '');
				$model->data[] = $object;
			} else if ($model->getType() == ArrayOf::VALUE) {
				if (is_array($item)) {
					throw new \Exception("Must not decode array for value type '$key'");
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
	public function decodeMapOf($key, $model, $data) {
		if (!is_array($data)) {
			throw new \Exception("Bad data when array expected. '$data'");
		}
		$model->data = array();
		foreach ($data as $itemKey => $item) {
			if ($model->hasGenerator()) {
				$object = $model->generate($item);
				$this->_decode($object, $item, $itemKey);
				$model->data[$itemKey] = $object;
			} else {
				if (is_array($item)) {
					throw new \Exception("Must not decode array for value type '$key'");
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
	
	/**
	 * @param string $key
	 * @param object $model
	 * @param MongoDate $data
	 */
	public function decodeDateTime($key, $model, $data) {
		CodeGuard::checkTypeAndThrow($data, 'MongoDate', CodeGuard::CHECK_NULL_OK);
		if ($data !== null) {
			$model->setTimeStamp($data->sec);
		}
	}
	
	
}

?>