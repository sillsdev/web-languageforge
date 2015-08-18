<?php

namespace Api\Model;

use Api\Model\Mapper\MongoMapper;

/**
 * List of users who are members of the specified project
 */
class UserList_ProjectModel extends Mapper\MapperListModel
{

    public function __construct($projectId)
    {
        parent::__construct(
                UserModelMongoMapper::instance(),
                array('username' => array('$regex' => '\w'), 'projects' => array('$in' => array(MongoMapper::mongoID($projectId)))),
                array('username', 'email', 'name')
        );
    }

}
