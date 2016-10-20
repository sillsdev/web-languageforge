<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperListModel;

class UserListModel extends MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            UserModelMongoMapper::instance(),
            array('username' => array('$regex' => '')),
            array('username', 'email', 'name', 'avatar_ref', 'role', 'projects', 'active')
        );
    }
}
