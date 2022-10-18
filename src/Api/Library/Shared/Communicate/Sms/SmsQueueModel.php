<?php

namespace Api\Library\Shared\Communicate\Sms;

use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\Mapper\MapperListModel;

class SmsQueueModel extends MapperListModel
{
    /**
     * @param string $databaseName
     */
    public function __construct($databaseName)
    {
        $this->entries = new MapOf(function () use ($databaseName) {
            return new SmsModel($databaseName);
        });
        parent::__construct(SmsMongoMapper::connect($databaseName), []);
    }

    /**
     * Reads messages from the queue that are in the 'new' state.
     */
    public function readNew()
    {
        $query = ["state" => ['$in' => [SmsModel::SMS_NEW]]];
        $this->_mapper->readListAsModels($this, $query);
    }
}
