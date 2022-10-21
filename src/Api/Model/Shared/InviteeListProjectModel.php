<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;

/**
 * List of users who are members of the specified project
 */
class InviteeListProjectModel extends MapperListModel
{
    /**
     * InviteeListProjectModel constructor.
     * @param string $projectId
     */
    public function __construct($projectId)
    {
        parent::__construct(
            UserModelMongoMapper::instance(),
            ["isInvited" => true, "projects" => ['$in' => [MongoMapper::mongoID($projectId)]]],
            ["username", "email", "name"]
        );
    }
}
