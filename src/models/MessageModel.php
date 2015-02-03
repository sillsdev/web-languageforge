<?php

namespace models;

use models\mapper\Id;

class MessageModelMongoMapper extends \models\mapper\MongoMapper
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

class MessageModel extends \models\mapper\MapperModel
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
