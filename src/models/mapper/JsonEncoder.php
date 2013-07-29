<?php
namespace models\mapper;

class JsonEncoder {
	
	/**
	 * @var string
	 */
	private $_idKey;
	
	public function __construct($idKey = null) {
		$this->_idKey = $idKey;
	}
	
	/**
	 * Sets key/values in the array from the public properties of $model
	 * @param object $model
	 * @return array
	 */
	public function encode($model) {
		$data = array();
		$properties = get_object_vars($model);
		if ($this->_idKey) {
			$idKey = $this->_idKey;
			// We don't want the 'idKey' in the data so remove that from the properties
			if (array_key_exists($idKey, $properties))
			{
				unset($properties[$idKey]);
			}
		}
		foreach ($properties as $key => $value) {
			if (is_a($value, 'models\mapper\ReferenceList')) {
				$data[$key] = $this->encodeReferenceList($model->$key);
			} else {
				// Special hack to help dubugging our app
				if ($key == 'projects' || $key == 'users') {
					throw new \Exception("Possible bad write of '$key'\n" . var_export($model, true));
				}
				$data[$key] = $value;
			}
		}
		return $data;
	}
	
	public function encodeReferenceList($model) {
		$result = array_map(
				function($id) {
			return new \MongoId($id);
		},
		$model->refs
		);
		return $result;
	}
	
	
	
}


?>