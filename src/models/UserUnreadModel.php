<?php
namespace models;

use models\mapper\ArrayOf;
use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class UnreadItem
{
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
	/**
	 * The type of Unread item e.g. activity, text, question, answer, comment
	 * @var string
	 */
	private $_type;
	
	/**
	 * @var ArrayOf ArrayOf<UnreadItem>
	 */
	public $unread;
	
	/**
	 * 
	 * @param string $itemType
	 * @param string $userId
	 * @param string $projectId
	 */
	public function __construct($itemType, $userId, $projectId) {
		$this->unread = new ArrayOf(
			ArrayOf::OBJECT, 
			function($data) {
				return new UnreadItem();
			}
		);
		$this->_type = $itemType;
		parent::__construct('unread_item', $userId, $projectId);
		$this->read();
	}
	
	public function read($id = '') {
		$mapper = self::mapper();
		$query = array(
				'type' => 'unread_item',
				'userRef' => MongoMapper::mongoID($this->userRef->asString())
		);
		if ($this->projectRef->asString() != '') {
			$query['projectRef'] = MongoMapper::mongoID($this->projectRef->asString());
		} else {
			$query['projectRef'] = null;
		}
		$exists = $mapper->readByProperties($this, $query);
	}
	
	/**
	 * 
	 * @param string $itemId
	 */
	public function markUnread($itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $this->_type;
		if (in_array($item, $this->unread->data)) {
			return;
		}
		$this->unread->data[] = $item;
	}
	
	/**
	 * 
	 * @param string $itemId
	 */
	public function markRead($itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $this->_type;
		foreach ($this->unread->data as $key => $value) {
			if ($value == $item) {
				unset($this->unread->data[$key]);
			}
		}
	}
	
	public function markAllRead() {
		foreach ($this->unread->data as $key => $value) {
			if ($value->type == $this->_type) {
				unset($this->unread->data[$key]);
			}
		}
	}
	
	/**
	 * 
	 * @param string $itemId
	 * @return boolean
	 */
	public function isUnread($itemId) {
		$item = new UnreadItem();
		$item->itemRef->id = $itemId;
		$item->type = $this->_type;
		return in_array($item, $this->unread->data);
	}
	
	/**
	 * 
	 * @return models\UnreadItem
	 */
	public function unreadItems() {
		$items = array();
		foreach ($this->unread->data as $key => $value) {
			if ($value->type == $this->_type) {
				$items[] = $value->itemRef->asString();
			}
		}
		return $items;
	}
	
	/**
	 * markUnreadForProjectMembers() is only intended to be called from a child class such as UnreadActivityModel 
	 * @param string $itemId
	 * @param ProjectModel $project
	 * @throws Exception
	 */
	public static function markUnreadForProjectMembers($itemId, $project) {
		$className = get_called_class();
		if ($className == 'models\UserUnreadModel') {
			throw new Exception("static method markUnreadForProject cannot be called from base class UserUnreadModel");
		}
		$userList = $project->listUsers();
		foreach ($userList->entries as $user) {
			$unreadModel = new $className($user['id'], $project->id->asString());
			$unreadModel->markUnread($itemId);
			$unreadModel->write();
		}
	}
}

?>
