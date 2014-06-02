<?php

namespace libraries\lfdictionary\dashboardtool;

use models\mapper\MongoStore;
use models\mapper\ReferenceList;



class DashboardToolMongoModel extends \models\mapper\MapperModel
{
	public function __construct($id = NULL)
	{
		parent::__construct(DashboardToolMongoMapper::instance(), $id);
	}
	
	public function readyByQuery($query)
	{
		$data = $this->findOneByQuery($query);
	}
		
	/**
	 * @var string
	 */
	public $id;

	/**
	* @var string
	*/
	public $project_id;
	
	/**
	* @var string
	*/
	public $field_type;
	
	/**
	* @var int
	*/
	public $counter_value;
	/**
	* @var int
	*/
	public $hg_version;
	/**
	* @var string
	*/
	public $hg_hash;
	/**
	* @var int
	*/
	public $time_stamp;

	// What else needs to be in the model?
	
}

?>