<?php
namespace models;

use models\UnreadItem;
use models\mapper\ArrayOf;
use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class UnreadItem 
{
	/**
	 * @var string
	 */
	public $type;
	
	/**
	 * @var IdReference
	 */
	public $questionRef;
	
	/**
	 * @var IdReference
	 */
	public $answerRef;
	
	/**
	 * @var IdReference
	 */
	public $commentRef;
}

class UserUnreadModel extends UserRelationModel
{
	public function __construct($id = '') {
		$this->unread = new ArrayOf(
			ArrayOf::OBJECT, 
			function($data) {
				return new UnreadItem(); 
			}
		);
		parent::__construct('unread', $id);
	}
	
	/**
	 * @var ArrayOf ArrayOf<UnreadItem>
	 */
	public $unread;
	
}

?>
