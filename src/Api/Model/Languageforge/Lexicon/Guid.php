<?php

namespace Api\Model\Languageforge\Lexicon;

use Ramsey\Uuid\Uuid;

// this class could simply extend Uuid to give full functionality. IJH 2016-25
class Guid
{
    /**
     * Regular expression pattern for finding a valid UUID4.
     */
    const UUID4_PATTERN = "[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}";

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
        if (!Uuid::isValid($guid) || !preg_match("/" . self::UUID4_PATTERN . "/", $guid)) {
            return false;
        }

        return true;
    }

    /**
     * @param $guid
     * @return string $guid if valid, otherwise create one
     */
    public static function makeValid($guid)
    {
        if (!$guid || !self::isValid($guid)) {
            $guid = self::create();
        }
        return $guid;
    }

    /**
     * @param string $idContainingGuid
     * @return string guid in $idContainingGuid if found, empty string otherwise
     */
    public static function extract($idContainingGuid)
    {
        $guid = "";
        if ($idContainingGuid) {
            $isMatched = preg_match("/" . self::UUID4_PATTERN . "/", $idContainingGuid, $guids);
            if ($isMatched && self::isValid($guids[0])) {
                $guid = $guids[0];
            }
        }
        return $guid;
    }
}
