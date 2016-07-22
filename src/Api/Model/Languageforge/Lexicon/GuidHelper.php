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

    /**
     * @param string $idContainingGuid
     * @return string guid in id if found, empty string otherwise
     */
    public static function extractGuid($idContainingGuid)
    {
        $guid = '';
        if ($idContainingGuid) {
            preg_match('/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/', $idContainingGuid, $guids);
            if (GuidHelper::isValid($guids[0])) {
                $guid = $guids[0];
            }
        }
        return $guid;
    }
}
