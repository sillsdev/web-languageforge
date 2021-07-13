<?php

namespace Api\Library\Shared;

use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

class UrlHelper
{
    public static function getHostname()
    {
        return Env::requireEnv('WEBSITE');
    }

    public static function baseUrl()
    {
        return "https://" . self::getHostname();
    }
}
