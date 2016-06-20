<?php

namespace Api\Model;

use Api\Model\Mapper\Id;
use Api\Model\Mapper\MapperModel;
use Api\Model\Mapper\MongoMapper;

class MessageModelMongoMapper extends MongoMapper
{
    /**
     * @var TextModelMongoMapper[]
     */
    private static $_pool = array();

    /**
     * @param string $databaseName
     * @return TextModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new MessageModelMongoMapper($databaseName, 'messages');
        }

        return static::$_pool[$databaseName];
    }

}

class MessageModel extends MapperModel
{
    /**
     * @var ProjectModel;
     */
    private $_projectModel;

    public function __construct($projectModel, $id = '')
    {
        $this->id = new Id();
        $this->_projectModel = $projectModel;
        $databaseName = $projectModel->databaseName();
        parent::__construct(MessageModelMongoMapper::connect($databaseName), $id);
    }

    public static function remove($databaseName, $id)
    {
        MessageModelMongoMapper::connect($databaseName)->remove($id);
    }

    public $id;

    public $subject;

    public $content;

}
