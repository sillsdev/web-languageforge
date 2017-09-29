<?php

namespace Api\Model\Scriptureforge\Sfchecks\Dto;

use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\UserModel;

class QuestionCommentDtoEncoder extends JsonEncoder
{
    public function encodeIdReference($key, $model)
    {
        if ($key == 'userRef') {
            $user = new UserModel($model->id);

            return array(
                    'userid' => $user->id->asString(),
                    'avatar_ref' => $user->avatar_ref,
                    'username' => $user->username);
        } else {
            $result = $model->id;

            return $result;
        }
    }

    public static function encode($model)
    {
        $e = new QuestionCommentDtoEncoder();

        return $e->_encode($model);
    }
}
