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
		if ($this->_idKey) {
			$idKey = $this->_idKey;
			// Map the Mongo _id to the property $idKey
			if (array_key_exists($idKey, $properties) && array_key_exists('_id', $values))
			{
				$model->$idKey = (string)$values['_id']; // MongoId
				unset($properties[$idKey]);
			}
		}
		foreach ($properties as $key => $value)
		{
			if (!array_key_exists($key, $values))
			{
				// oops // TODO Add to list, throw at end CP 2013-06
				continue;
			}
			if (is_a($value, 'models\mapper\ReferenceList')) {
				$this->decodeReferenceList($model->$key, $values[$key]);
			} else {
				$model->$key = $values[$key];
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
			// This likely cam from an API client, who shouldn't be sending this.
			return;
		}
		$refsArray = $data;
		foreach ($refsArray as $objectId) {
			if (!is_a($objectId, 'MongoId')) {
				throw new \Exception(
						"Invalid type '" . gettype($objectId) . "' in ref collection '$key'"
				);
			}
			array_push( $model->refs, (string)$objectId );
		}
	}
	
	
}

?>