<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;

class UserRelationModel extends MapperModel
{
    /**
     * UserRelationModel constructor.
     * @param string $type
     * @param string $userId
     * @param string $projectId
     */
    public function __construct($type, $userId, $projectId)
    {
        $this->id = new Id();
        $this->type = $type;
        $this->userRef = new IdReference($userId);
        $this->projectRef = new IdReference($projectId);
        parent::__construct(self::mapper(), '');
    }

    /** @var Id */
    public $id;

    /** @var string */
    public $type;

    /** @var IdReference */
    public $userRef;

    /** @var IdReference */
    public $projectRef;

    public static function mapper()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new MongoMapper(DATABASE, 'userrelation');
        }

        return $instance;
    }

    /**
     * Removes a relation from the collection
     * @param string $id
     */
    public static function remove($id)
    {
        self::mapper()->remove($id);
    }
}
