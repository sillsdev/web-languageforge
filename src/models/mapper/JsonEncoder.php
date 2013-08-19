<?php
namespace models\mapper;

use libraries\palaso\CodeGuard;

class JsonEncoder {
	
	/**
	 * Sets key/values in the array from the public properties of $model
	 * @param object $model
	 * @return array
	 */
	public static function encode($model) {
		$encoder = new JsonEncoder();
		return $encoder->_encode($model);
	}
	
	/**
	 * Sets key/values in the array from the public properties of $model
	 * @param object $model
	 * @return array
	 */
	protected function _encode($model) {
		$data = array();
		$properties = get_object_vars($model);
		foreach ($properties as $key => $value) {
			if (is_a($value, 'models\mapper\IdReference')) {
				$data[$key] = $this->encodeIdReference($key, $model->$key);
			} else if (is_a($value, 'models\mapper\Id')) {
				$data[$key] = $this->encodeId($key, $model->$key);
			} else if (is_a($value, 'models\mapper\ArrayOf')) {
				$data[$key] = $this->encodeArrayOf($key, $model->$key);
			} else if (is_a($value, 'models\mapper\MapOf')) {
				$data[$key] = $this->encodeMapOf($key, $model->$key);
			} else if (is_a($value, 'DateTime')) {
				$data[$key] = $this->encodeDateTime($key, $model->$key);
			} else if (is_a($value, 'models\mapper\ReferenceList')) {
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
	public function encodeIdReference($key, $model) {
		// Note: $key may be used in derived methods
		$result = $model->id;
		return $result;
	}

	/**
	 * @param string $key
	 * @param Id $model
	 * @return string
	 */
	public function encodeId($key, $model) {
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
	public function encodeArrayOf($key, $model) {
		// Note: $key may be used in derived methods
		$result = array();
		foreach ($model->data as $item) {
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
	public function encodeMapOf($key, $model) {
		$result = array();
		$count = 0;
		foreach ($model->data as $itemKey => $item) {
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
		return $count == 0 ? new \stdClass() : $result;
	}
	
	/**
	 * @param string $key
	 * @param ReferenceList $model
	 * @return array
	 */
	public function encodeReferenceList($key, $model) {
		// Note: $key may be used in derived methods
		$result = array_map(
			function($id) {
				CodeGuard::checkTypeAndThrow($id, 'models\mapper\Id');
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
	public function encodeDateTime($key, $model) {
		return $model->format(\DateTime::ISO8601);
	}
	
}


?>