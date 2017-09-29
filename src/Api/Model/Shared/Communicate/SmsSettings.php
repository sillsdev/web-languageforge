<?php

namespace Api\Model\Shared\Communicate;

class SmsSettings
{
    public function __construct()
    {
    }

    /** @var string */
    public $accountId;

    /** @var string */
    public $authToken;

    /** @var string */
    public $fromNumber;

    /**
     * Returns true if all the credentials are set.
     * @return bool
     */
    public function hasValidCredentials()
    {
        return $this->accountId && $this->authToken && $this->fromNumber;
    }
}
