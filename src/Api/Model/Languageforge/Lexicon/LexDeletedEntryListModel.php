<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\ProjectModel;

class LexDeletedEntryListModel extends \Api\Model\Mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new \Api\Model\Mapper\MongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }

    /**
     *
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     */
    public function __construct($projectModel, $newerThanTimestamp = null)
    {
        if (!is_null($newerThanTimestamp)) {
            $startDate = new \MongoDate($newerThanTimestamp);
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate), 'isDeleted' => true), array('id'));
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array('isDeleted' => true), array('id'));
        }
    }
}
