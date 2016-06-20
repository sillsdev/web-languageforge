<?php

namespace Api\Model;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\IdReference;
use Api\Model\Mapper\MongoMapper;

class UserUnreadModel extends UserRelationModel
{
    /**
     * The type of Unread item e.g. activity, text, question, answer, comment
     * @var string
     */
    private $_type;

    /**
     * @var ArrayOf ArrayOf<Api\Model\UnreadItem>
     */
    public $unread;

    /**
     *
     * @var IdReference
     */
    public $questionRef;

    /**
     *
     * @param string $itemType
     * @param string $userId
     * @param string $projectId
     * @param string $questionId
     */
    public function __construct($itemType, $userId, $projectId, $questionId = '')
    {
        $this->unread = new ArrayOf(
            function() {
                return new UnreadItem();
            }
        );
        $this->questionRef = new IdReference($questionId);
        $this->_type = $itemType;
        parent::__construct('unread_item', $userId, $projectId);
        $this->read();
    }

    public function read($id = '')
    {
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
        if ($this->questionRef->asString() != '') {
            $query['questionRef'] = MongoMapper::mongoID($this->questionRef->asString());
        } else {
            $query['questionRef'] = null;
        }
        $mapper->readByProperties($this, $query);
    }

    /**
     *
     * @param string $itemId
     */
    public function markUnread($itemId)
    {
        $item = new UnreadItem();
        $item->itemRef->id = $itemId;
        $item->type = $this->_type;
        if (in_array($item, (array) $this->unread)) {
            return;
        }
        $this->unread[] = $item;
    }

    /**
     *
     * @param string $itemId
     */
    public function markRead($itemId)
    {
        $item = new UnreadItem();
        $item->itemRef->id = $itemId;
        $item->type = $this->_type;
        $c = $this->unread->count();
        for ($i = $c - 1; $i >= 0; $i--) {
            if ($this->unread[$i] == $item) {
                unset($this->unread[$i]);
//                break; // The lack of a break here is consistent with the previous implementation, and currently isn't a performance issue. CP 2013-12
            }
        }
    }

    public function markAllRead()
    {
        $c = $this->unread->count();
        for ($i = $c - 1; $i >= 0; $i--) {
            if ($this->unread[$i]->type == $this->_type) {
                unset($this->unread[$i]);
            }
        }
    }

    /**
     *
     * @param string $itemId
     * @return boolean
     */
    public function isUnread($itemId)
    {
        $item = new UnreadItem();
        $item->itemRef->id = $itemId;
        $item->type = $this->_type;

        return in_array($item, (array) $this->unread);
    }

    /**
     * @return array<Api\Model\UnreadItem>
     */
    public function unreadItems()
    {
        $items = array();
        foreach ($this->unread as $value) {
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
     * @throws \Exception
     */
    public static function markUnreadForProjectMembers($itemId, $project, $questionId = '', $exceptThisUserId = '')
    {
        $className = get_called_class();
        if ($className == 'Api\Model\UserUnreadModel') {
            throw new \Exception("static method markUnreadForProject cannot be called from base class UserUnreadModel");
        }
        $userList = $project->listUsers();
        foreach ($userList->entries as $user) {
            if ($user['id'] == $exceptThisUserId) {
                continue;
            }
            // TODO: Review: This code is getting cumbersome with if statements for specific child classes.  Maybe it's time to move this method to the child classes - cjh 2013/10
            if ($questionId != '') {
                $unreadModel = new $className($user['id'], $project->id->asString(), $questionId);
            } else {
                $unreadModel = new $className($user['id'], $project->id->asString());
            }
            $unreadModel->markUnread($itemId);
            $unreadModel->write();
        }
    }
}
