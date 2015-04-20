<?php
namespace libraries\shared\sms;

use models\mapper\MapOf;

class SmsQueueModel extends \models\mapper\MapperListModel
{

    /**
     * @param string $databaseName
     */
    public function __construct($databaseName)
    {
        $this->entries = new MapOf(function ($data) use ($databaseName) { return new SmsModel($databaseName); });
        parent::__construct(
            SmsMongoMapper::connect($databaseName),
            array()
        );
    }

    /**
     * Reads messages from the queue that are in the 'new' state.
     */
    public function readNew()
    {
        $query = array('state' => array('$in' => array(SmsModel::SMS_NEW)));
        $this->_mapper->readListAsModels($this, $query);
    }

}
