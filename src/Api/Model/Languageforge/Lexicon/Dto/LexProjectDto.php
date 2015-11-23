<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\UserModel;

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
     * @returns array - the DTO array
     */
    public static function encode($projectId)
    {
        $project = new LexiconProjectModel($projectId);
        $projectJson = LexProjectDtoEncoder::encode($project);

        $data = array();
        $data['project'] = array();
        $data['project']['interfaceLanguageCode'] = $projectJson['interfaceLanguageCode'];
        $data['project']['ownerRef'] = $projectJson['ownerRef'];
        $data['project']['projectCode'] = $projectJson['projectCode'];
        $data['project']['featured'] = $projectJson['featured'];
        if ($project->sendReceiveIdentifier) {
            $data['project']['sendReceive'] = array();
            $data['project']['sendReceive']['identifier'] = $projectJson['sendReceiveIdentifier'];
            $data['project']['sendReceive']['username'] = $projectJson['sendReceiveUsername'];
        }

        return $data;
    }
}
