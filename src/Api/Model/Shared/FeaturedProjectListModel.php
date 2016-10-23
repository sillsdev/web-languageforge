<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperListModel;

class FeaturedProjectListModel extends MapperListModel
{
    public function __construct()
    {
        parent::__construct(
            ProjectModelMongoMapper::instance(),
            array('featured' => true),
            array('projectName', 'language')
        );
    }
}
