<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\MapperModel;
use Api\Model\Shared\Mapper\MongoMapper;

class MessageModel extends MapperModel
{
    /**
     * @param ProjectModel $projectModel
     * @param string $id
     */
    public function __construct($projectModel, $id = "")
    {
        $this->id = new Id();
        $this->_projectModel = $projectModel;
        $databaseName = $projectModel->databaseName();
        parent::__construct(MessageModelMongoMapper::connect($databaseName), $id);
    }

    public $id;

    public $subject;

    public $content;

    /** @var ProjectModel */
    private $_projectModel;

    public static function remove($databaseName, $id)
    {
        MessageModelMongoMapper::connect($databaseName)->remove($id);
    }
}

class MessageModelMongoMapper extends MongoMapper
{
    /**
     * @param string $databaseName
     * @return MessageModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new MessageModelMongoMapper($databaseName, "messages");
        }

        return static::$_pool[$databaseName];
    }

    /** @var MessageModelMongoMapper[] */
    private static $_pool = [];
}
