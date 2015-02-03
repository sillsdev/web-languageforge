<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\UserModel;

use models\mapper\JsonEncoder;

class LexProjectDtoEncoder extends JsonEncoder
{
    public function encodeIdReference($key, $model)
    {
        // TODO ownerRef is declared in ProjectModel as an IdReference.  Here, it gets encoded as an Array 2014-08 DDW
        // Trello: https://trello.com/c/Zw0aLLYv
        if ($key == 'ownerRef') {
            $user = new UserModel();
            if ($user->exists($model->asString())) {
                $user->read($model->asString());

                return array(
                        'id' => $user->id->asString(),
                        'username' => $user->username);
            } else {
                return '';
            }
        } else {
            return $model->asString();
        }
    }

    public static function encode($model)
    {
        $encoder = new LexProjectDtoEncoder();
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

class LexProjectDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @returns array - the DTO array
     */
    public static function encode($projectId, $userId)
    {
        $project = new LexiconProjectModel($projectId);
        $projectJson = LexProjectDtoEncoder::encode($project);

        $data = array();
        $data['project'] = array();
        $data['project']['interfaceLanguageCode'] = $projectJson['interfaceLanguageCode'];
        $data['project']['ownerRef'] = $projectJson['ownerRef'];
        $data['project']['projectCode'] = $projectJson['projectCode'];
        $data['project']['featured'] = $projectJson['featured'];

        return $data;
    }
}
