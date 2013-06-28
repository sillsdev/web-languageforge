<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class Project_model_MongoMapper extends MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new Project_model_MongoMapper(SF_DATABASE, 'projects');
		}
		return $instance;
	}
}

class Project_model extends MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(Project_model_MongoMapper::instance(), $id);
	}

	public static function remove($id)
	{
		Project_model_MongoMapper::instance()->remove($id);
	}
	
	public $id;
	
	public $projectname;
	public $language;
	
	// What else needs to be in the model?
	
}

class Project_list_model extends MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			Project_model_MongoMapper::instance(),
			array(),
			array('projectname', 'language')
		);
	}
}

?>