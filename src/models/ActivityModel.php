<?php

namespace models;

use models\mapper\ArrayOf;

use models\mapper\MongoMapper;

use models\mapper\IdReference;

use models\mapper\Id;
use models\mapper\MapOf;

class ActivityModelMongoMapper extends \models\mapper\MongoMapper
{
	/**
	 * @var ActivityModelMongoMapper[]
	 */
	private static $_pool = array();
	
	/**
	 * @param string $databaseName
	 * @return ActivityModelMongoMapper
	 */
	public static function connect($databaseName) {
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = new ActivityModelMongoMapper($databaseName, 'activity');
		}
		return static::$_pool[$databaseName];
	}
	
}

class ActivityModel extends \models\mapper\MapperModel
{
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $id
	 */
	public function __construct($projectModel, $id = '') {
		$this->id = new Id();
		$this->projectRef = new IdReference($projectModel->id->asString());
		$this->userRef = new IdReference();
		$this->actionRefs = new ArrayOf(ArrayOf::OBJECT,
			function() {
				return new IdReference();
			}
		);
		$this->action = "unknown";
		$this->date = new DateTime(time()); // set the timestamp to now
		$this->actionContent = new ArrayOf(ArrayOf::VALUE); // strings
		$databaseName = $projectModel->databaseName();
		parent::__construct(ActivityModelMongoMapper::connect($databaseName), $id);
	}	
	
	/**
	 * 
	 * @param string $id
	 */
	public function addRef($id) {
		$this->actionRefs->append(new IdReference($id));
	}
	
	/**
	 * 
	 * @param string $content
	 */
	public function addContent($content) {
		$this->actionContent->append($content);
	}
	
	// TODO add a userFilter ArrayOf type that we can use to query Mongo for activities that only apply to specific users
	
	/**
	 * @var Id
	 */
	public $id;
	
	/**
	 * 
	 * @var IdReference
	 */
	public $projectRef;
	
	/**
	 * 
	 * @var IdReference
	 */
	public $userRef;
	
	/**
	 * 
	 * @var string 
	 * Possible values are:
	 * 
	 * add_comment
	 * update_comment
	 * add_answer
	 * update_answer
	 * add_text
	 * add_question
	 * change_state_of_question
	 * update_score
	 * add_user_to_project
	 * 
	 */
	// TODO add broadcast_message as an action on a GlobalActivityModel class cjh 2013-08
	public $action;
	
	/**
	 * 
	 * @var ArrayOf
	 * ArrayOf<IdReference>
	 */
	public $actionRefs;
	
	/**
	 * 
	 * @var ArrayOf
	 * ArrayOf<string>
	 */
	public $actionContent;
	
	
	/**
	 * @var \DateTime
	 */
	public $date;
	
}

class ActivityListModel extends \models\mapper\MapperListModel
{

	public function __construct($projectModel, $textId)
	{
		parent::__construct(
			ActivityModelMongoMapper::connect($projectModel->databaseName()),
			array('title' => array('$regex' => ''), 'textRef' => MongoMapper::mongoID($textId)),
			array('title')
		);
	}
	
}

?>