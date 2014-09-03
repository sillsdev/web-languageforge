<?php

namespace models;

require_once APPPATH . 'models/CommunityModel.php';

class CommunityModelMongoMapper extends \models\mapper\MongoMapper
{
    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new CommunityModelMongoMapper(LF_DATABASE, 'communities');
        }

        return $instance;
    }
}

class CommunityModel extends \models\mapper\MapperModel
{
    public function __construct($id = null)
    {
        $this->users = array();
        parent::__construct(CommunityModelMongoMapper::instance(), $id);
    }

    /**
     * Removes this project from the collection.
     * @param string $id
     */
    public static function remove($id)
    {
        CommunityModelMongoMapper::instance()->remove($id);
    }

    /**
     * Adds the $userId as a member of this project.
     * Does not add the reciprocal relationship.
     * @param string $userId
     * @see ProjectModel::addUser
     */
    public function _addUser($userId)
    {
        assert(is_array($this->users));
        if (in_array($userId, $this->users)) {
            return;
        }
        $this->users[] = $userId;
    }

    /**
     * Adds the $userId as a member of this project.
     * Note that you still need to call write() to persist the model.
     * @param string $userId
     */
    public function addUser($userId)
    {
        $this->_addUser($userId);
        $userModel = new UserModel($userId);
        $userModel->_addProject($this->id);
        $userModel->write();
    }

    /**
     * Removes the $userId from this project.
     * Does not remove the reciprocal relationship.
     * @param string $userId
     * @see ProjectModel::removeUser
     */
    public function _removeUser($userId)
    {
        assert(is_array($this->users));
        if (!in_array($userId, $this->users)) {
            return;
//             throw new \Exception("User '$userId' is not a member of project '$this->id'");
        }
        $this->users = array_diff($this->users, array($userId));
    }

    /**
     * Removes the $userId from this project.
     * Note that you still need to call write() to persist the model.
     * @param string $userId
     */
    public function removeUser($userId)
    {
        $this->_removeUser($userId);
        $userModel = new UserModel($userId);
        $userModel->_removeProject($this->id);
        $userModel->write();
    }

    public function listUsers()
    {
        $userList = new User_list_projects_model($this->id);
        $userList->read();

        return $userList;
    }

    public $id;

    public $communityname;
    public $language;

    public $users;

    // What else needs to be in the model?

}

class CommunityListModel extends \models\mapper\MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            CommunityModelMongoMapper::instance(),
            array(),
            array('communityname', 'language')
        );
    }
}

class CommunityListUsersModel extends \models\mapper\MapperListModel
{

    public function __construct($userId)
    {
        parent::__construct(
                CommunityModelMongoMapper::instance(),
                array('users' => array('$in' => array($userId))),
                array('communityname')
        );
    }

}
