<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class User_model_MongoMapper extends MongoMapper
{
	function __construct()
	{ 
		parent::__construct('scriptureforge');
	}
	
	/**
	 * @param User_model $model
	 * @param MongoId $id
	 */
	public function read($model, $id)
	{
		assert(is_string($id));
		$collection = $this->_db->users;
		$data = $collection->findOne(array("_id" => new MongoId($id)));
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

class User_model extends MapperModel
{
	public $id;
	
	public $userName;
	
	public $email;
	
	public function __construct($id = NULL)
	{
		parent::__construct(new User_model_MongoMapper(), $id);
	}
	
}

?>