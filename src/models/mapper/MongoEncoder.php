<?php
namespace models\mapper;

class MongoEncoder {
	
	/**
	 * Sets key/values in the array from the public properties of $model
	 * @param object $model
	 * @return array
	 */
	public static function encode($model) {
		$encoder = new MongoEncoder();
		return $encoder->_encode($model);
	}
	
	/**
	 * Sets key/values in the array from the public properties of $model
	 * @param object $model
	 * @return array
	 */
	protected function _encode($model, $encodeId = false) {
		$data = array();
		$properties = get_object_vars($model);
		foreach ($properties as $key => $value) {
			if (is_a($value, 'models\mapper\IdReference')) {
				$data[$key] = $this->encodeIdReference($model->$key);
			} else if (is_a($value, 'models\mapper\Id')) {
				if ($encodeId) {
					$data[$key] = $this->encodeId($model->$key);
				}
			} else if (is_a($value, 'models\mapper\ArrayOf')) {
				$data[$key] = $this->encodeArrayOf($model->$key);
			} else if (is_a($value, 'models\mapper\ReferenceList')) {
				$data[$key] = $this->encodeReferenceList($model->$key);
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
	public function encodeIdReference($model) {
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
	public function encodeId($model) {
		$mongoId = MongoMapper::mongoID($model->id);
		if (empty($model->id)) {
			$model->id = (string)$mongoId;
		}
		return $mongoId;
	}

	/**
	 * @param ArrayOf $model
	 * @return array
	 * @throws \Exception
	 */
	public function encodeArrayOf($model) {
		$result = array();
		foreach ($model->data as $item) {
			if (is_object($item)) {
				$result[] = $this->_encode($item, true);
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
	 * @param ReferenceList $model
	 * @return array
	 */
	public function encodeReferenceList($model) {
		$result = array_map(
			function($id) {
				return MongoMapper::mongoID($id->asString());
			},
			$model->refs
		);
		return $result;
	}
	
	
	
}


?>