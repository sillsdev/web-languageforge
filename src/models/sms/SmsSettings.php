<?php
namespace models\sms;

class SmsSettings
{

    /**
     *
     */
    public function __construct()
    {
    }

    /**
     * Returns true if all the credentials are set.
     * @return bool
     */
    public function hasValidCredentials()
    {
        return $this->accountId && $this->authToken && $this->fromNumber;
    }

    /**
     * @var string
     */
    public $accountId;

    /**
     * @var string
     */
    public $authToken;

    /**
     *
     * @var string
     */
    public $fromNumber;
}
