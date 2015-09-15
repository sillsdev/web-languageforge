<?php

namespace Api\Model\Languageforge\Lexicon;

class LexOptionListListModel extends \Api\Model\Mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'optionlists');
        }

        return $instance;
    }

    /**
     *
     * @param ProjectModel $projectModel
     * @param int          $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        if (!is_null($newerThanTimestamp)) {
            $startDate = new \MongoDate($newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate)), array());
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('name' => array('$regex' => '')));
        }
    }

}
