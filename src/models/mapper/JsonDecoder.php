<?php
namespace models\mapper;

class JsonDecoder {
	
	/**
	 * @var string
	 */
	private $_idKey;
	
	public function __construct($idKey = null) {
		$this->_idKey = $idKey;
	}
	
	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $values A mixed array of JSON (like) data.
	 */
	public function decode($model, $values) {
		$properties = get_object_vars($model);
// 		if ($this->_idKey) {
// 			$idKey = $this->_idKey;
// 			// Map the Mongo _id to the property $idKey
// 			if (array_key_exists($idKey, $properties) && array_key_exists('_id', $values))
// 			{
// 				$model->$idKey = (string)$values['_id']; // MongoId
// 				unset($properties[$idKey]);
// 			}
// 		}
		foreach ($properties as $key => $value) {
			if (is_a($value, 'models\mapper\Id')) {
				$this->decodeId($model->$key, $values['_id']); // '_id' is the id used by Mongo
			} else if (is_a($value, 'models\mapper\ArrayOf')) {
				$this->decodeArrayOf($model->$key, $values[$key]);
			} else if (is_a($value, 'models\mapper\ReferenceList')) {
				$this->decodeReferenceList($model->$key, $values[$key]);
			} else if (is_object($value)) {
				$this->decode($model->$key, $values[$key]);
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
	 * @param Id $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeId($model, $data) {
		if (is_array($data)) {
			throw new \Exception("Bad data when id expected. '$data'");
		}
		if (is_a($data, 'MongoId')) {
			$model->id = (string)$data;
		} else {
			$model->id = $data;
		}
	}
	
	/**
	 * @param ArrayOf $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeArrayOf($model, $data) {
		if (!is_array($data)) {
			throw new \Exception("Bad data when array expected. '$data'");
		}
		$model->data = array();
		foreach ($data as $item) {
			if ($model->getType() == ArrayOf::OBJECT) {
				$object = $model->generate($item);
				$this->decode($object, $item);
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