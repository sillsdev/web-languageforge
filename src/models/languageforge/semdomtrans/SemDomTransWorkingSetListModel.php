<?php
namespace models\languageforge\semdomtrans;

use models\ProjectModel;

class SemDomTransWorkingSetListModel extends \models\mapper\MapperListModel
{
    public static function mapper($databaseName)
    {
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new \models\mapper\MongoMapper($databaseName, 'semDomTransWorkingSets');
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
            parent::__construct( self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate)),  array(), array('name' => 1));
        } else {
            parent::__construct( self::mapper($projectModel->databaseName()), array(),  array(), array('name' => 1));
        }
    }
}
