<?php

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

class UserModel extends MapperModel
{
	public $id;
	
	public $userName;
	
	public $email;
	
	public function __construct($id = NULL)
	{
		parent::__construct(new UserModel_MongoMapper(), $id);
	}
	
}

?>