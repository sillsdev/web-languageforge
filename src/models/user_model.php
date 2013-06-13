<?php

class ModelMapper /*extends CI_Model*/
{
	protected $_mapper;
	
	function __construct($mapper)
	{
		$this->_mapper = $mapper;
	}
	
}

class MongoMapper
{
	/**
	 * 
	 * @var MongoDB
	 */
	protected $_db;
	
	/**
	 * @var string
	 */
	private $_idKey;
	
	/**
	 * @param string $database
	 * @param string $collection
	 * @param string $idKey defaults to id
	 */
	public function __construct($database, $idKey = 'id')
	{
		$this->_db = MongoStore::connect($database);
		$this->_idKey = $idKey;
	}
	
	/**
	 * Sets the public properties of $model to values from $values[propertyName] 
	 * @param object $model
	 * @param array $values
	 */
	public function decode($model, $values)
	{
		$properties = get_object_vars($model);
		foreach ($properties as $key => $value)
		{
			if (!array_key_exists($key, $values))
			{
				// oops // TODO Add to list, throw at end CP 2013-06
				continue;
			}
			$model->$key = $values[$key];
// 			$model[$key] = $values[$key];
// 			$model->__set($key, $values[$key]);
		}
	}

	/**
	 * Sets key/values in the array to the public properties of $model
	 * @param object $model
	 * @return array
	 */
	public function encode($model)
	{
		$data = array();
		$properties = get_object_vars($model);
		foreach ($properties as $key => $value)
		{
			$data[$key] = $value;
		}
		return $data;
	}
	
	/**
	 * 
	 * @param MongoCollection $collection
	 * @param array $data
	 * @param MongoId $id
	 */
	protected function update($collection, $data, $id)
	{
		assert(is_a($id, 'MongoId'));
		$result = $collection->update(
				array('_id' => "ObjectId($id)"),
				$data,
				array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
		return isset($result['upserted']) ? $result['upserted'] : $id;
	}
	
}

class UserModel_MongoMapper extends MongoMapper
{
	function __construct()
	{ 
		parent::__construct('scriptureforge');
	}
	
	/**
	 * @param UserModel $model
	 * @param MongoId $id
	 */
	public function read($model, $id)
	{
		assert(is_a($id, 'MongoId'));
		$collection = $this->_db->users;
		$data = $collection->findOne(array("_id" => $id));
		if ($data === NULL)
		{
			throw new Exception("Could not find id '$id'");
		}	
		$this->decode($model, $data);
	}
	
	public function write($model)
	{
		$collection = $this->_db->users;
		$data = $this->encode($model);
		return $this->update($collection, $data, $model->id);
	}
	
	
}

class UserModel extends ModelMapper
{
	public $id;
	
	public $userName;
	
	public $email;
	
	public function __construct($id = NULL)
	{
		parent::__construct(new UserModel_MongoMapper());
		if (!empty($id))
		{
			$this->_mapper->read($this, $id);
		}
	}
	
	/**
	 * @return string The unique id of the object written
	 */
	function write()
	{
		return $this->_mapper->write($this);
	}
		
}

?>