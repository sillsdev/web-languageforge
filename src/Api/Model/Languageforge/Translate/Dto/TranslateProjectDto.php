<?php

namespace Api\Model\Languageforge\Translate\Dto;

use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\UserModel;

class TranslateProjectDtoEncoder extends JsonEncoder
{
    public function encodeIdReference($key, $model)
    {
        // TODO ownerRef is declared in ProjectModel as an IdReference.  Here, it gets encoded as an Array 2014-08 DDW
        // Trello: https://trello.com/c/Zw0aLLYv
        if ($key == 'ownerRef') {
            $user = new UserModel();
            if ($user->exists($model->asString())) {
                $user->read($model->asString());

                return [
                    'id' => $user->id->asString(),
                    'username' => $user->username
                ];
            } else {
                return '';
            }
        } else {
            return $model->asString();
        }
    }

    public static function encode($model)
    {
        $encoder = new TranslateProjectDtoEncoder();
        $data = $encoder->_encode($model);
        if (method_exists($model, 'getPrivateProperties')) {
            $privateProperties = (array) $model->getPrivateProperties();
            foreach ($privateProperties as $prop) {
                unset($data[$prop]);
            }
        }

        return $data;
    }
}

class TranslateProjectDto
{
    /**
     * @param string $projectId
     * @returns array - the DTO array
     */
    public static function encode($projectId)
    {
        $project = new TranslateProjectModel($projectId);
        $projectDto = TranslateProjectDtoEncoder::encode($project);

        $data = [];
        $data['project'] = [];
        $data['project']['interfaceLanguageCode'] = $projectDto['interfaceLanguageCode'];
        $data['project']['ownerRef'] = $projectDto['ownerRef'];
        $data['project']['projectCode'] = $projectDto['projectCode'];
        $data['project']['featured'] = $projectDto['featured'];

        return $data;
    }
}
