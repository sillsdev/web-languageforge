<?php

namespace Api\Model\Languageforge\Lexicon;

use Ramsey\Uuid\Uuid;

class GuidHelper
{
    /**
     * @return string
     */
    public static function create()
    {
        return Uuid::uuid4()->toString();
    }

    /**
     * @param string $guid
     * @return bool
     */
    public static function isValid($guid)
    {
        return Uuid::isValid($guid);
    }
}
