<?php

namespace Api\Library\Shared\Communicate\Sms;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MapperModel;

class SmsModel extends MapperModel
{
    const SMS_NEW = "new";
    const SMS_SENDING = "sending";
    const SMS_SENT = "sent";
    const SMS_FAIL = "fail";

    const SMS_TWILIO = "twilio";

    /**
     * @param string $databaseName
     * @param string $id
     */
    public function __construct($databaseName, $id = "")
    {
        $this->id = new Id();
        $this->userRef = new IdReference();
        $this->dateCreated = new \DateTime();
        $this->dateSent = new \DateTime();
        $this->provider = self::SMS_TWILIO;
        $this->state = self::SMS_NEW;
        parent::__construct(SmsMongoMapper::connect($databaseName), $id);
    }

    /** @var Id */
    public $id;

    /** @var IdReference */
    public $userRef;

    /** @var string */
    public $userName;

    /** @var string */
    public $from;

    /** @var string */
    public $to;

    /** @var string */
    public $message;

    /** @var string */
    public $state;

    /** @var string */
    public $error;

    /** @var \DateTime */
    public $dateCreated;

    /** @var \DateTime */
    public $dateSent;

    /** @var string */
    public $provider;

    /** @var string */
    public $providerInfo;

    public static function remove($databaseName, $id)
    {
        SmsMongoMapper::connect($databaseName)->remove($id);
    }
}
