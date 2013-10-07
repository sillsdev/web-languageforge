<?php
namespace models;

use models\mapper\ArrayOf;
use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class UnreadItem
{
	const ACTIVITY = 'activity';
	const ANSWER = 'answer';
	const COMMENT = 'comment';
	
	public function __construct() {
		$this->itemRef = new IdReference();
		$this->type = "";
	}
	
	/**
	 * @var IdReference
	 */
	public $itemRef;
	
	/**
	 * 
	 * @var string
	 */
	public $type;
}

class UserUnreadModel extends UserRelationModel
{
	public function __construct($userId = '') {
		$this->unread = new ArrayOf(
			ArrayOf::OBJECT, 
			function($data) {
				return new UnreadItem();
			}
		);
		parent::__construct('unread_item', $userId);
	}
	
	public function markUnread($itemType, $itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $itemType;
		if (in_array($item, $this->unread->data)) {
			return;
		}
		$this->unread->data[] = $item;
		
	}
	
	public function markRead($itemType, $itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $itemType;
		foreach ($this->unread->data as $key => $value) {
			if ($value == $item) {
				unset($this->unread->data[$key]);
			}
		}
	}
	
	public function isUnread($itemType, $itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $itemType;
		return in_array($item, $this->unread->data);
	}
	
	public function unreadCount($itemType) {
		$count = 0;
		foreach ($this->unread->data as $key => $value) {
			if ($value->type == $itemType) {
				$count++;
			}
		}
		return $count;
	}
	
	/**
	 * @var ArrayOf ArrayOf<UnreadItem>
	 */
	public $unread;
}

?>
