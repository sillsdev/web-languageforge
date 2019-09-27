<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperListModel;

class ProjectInsightsModel extends MapperListModel
{
    public function __construct($appName)
    {
        parent::__construct(
            ProjectModelMongoMapper::instance(),
            array('appName' => $appName),
            array()
        );
    }
}
