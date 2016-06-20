<?php

namespace Api\Model;

use Api\Model\Mapper\MapperListModel;


class UserListModel extends MapperListModel
{

    public function __construct()
    {
        parent::__construct(
            UserModelMongoMapper::instance(),
            array('username' => array('$regex' => '')),
            array('username', 'email', 'name', 'avatar_ref', 'role')
        );
    }

}

