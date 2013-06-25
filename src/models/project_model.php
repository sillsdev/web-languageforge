<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class Project_model_MongoMapper extends MongoMapper
{
	function __construct()
	{ 
		parent::__construct('scriptureforge', 'projects');
	}
	
}

class Project_model extends MapperModel
{
	public $id;
	
	public $projectname;
	public $language;
	
	// What else needs to be in the model?
	
}
Project_model::init(new Project_model_MongoMapper());

class Project_list_model extends MapperListModel
{
	function __construct()
	{
		parent::__construct(array(), array('projectname', 'language'));
	}
}
Project_list_model::init(new Project_model_MongoMapper());

?>