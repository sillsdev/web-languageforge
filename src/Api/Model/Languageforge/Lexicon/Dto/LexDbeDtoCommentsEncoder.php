<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\UserModel;

class LexDbeDtoCommentsEncoder extends JsonEncoder
{
    public function encodeIdReference(&$key, $model)
    {
        if ($key == "createdByUserRef" || $key == "modifiedByUserRef") {
            $user = new UserModel();
            if ($user->readIfExists($model->asString())) {
                return [
                    "id" => $user->id->asString(),
                    "avatar_ref" => $user->avatar_ref,
                    "name" => $user->name,
                    "username" => $user->username,
                ];
            } else {
                return "";
            }
        } else {
            return $model->asString();
        }
    }

    public static function encode($model)
    {
        $e = new LexDbeDtoCommentsEncoder();

        return $e->_encode($model);
    }
}
