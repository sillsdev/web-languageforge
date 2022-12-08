<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\UserModel;

class LexProjectDtoEncoder extends JsonEncoder
{
    public function encodeIdReference(&$key, $model)
    {
        // TODO ownerRef is declared in ProjectModel as an IdReference.  Here, it gets encoded as an Array 2014-08 DDW
        // Trello: https://trello.com/c/Zw0aLLYv
        if ($key == "ownerRef") {
            $user = new UserModel();
            if ($user->readIfExists($model->asString())) {
                return [
                    "id" => $user->id->asString(),
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
        $encoder = new LexProjectDtoEncoder();
        $data = $encoder->_encode($model);
        if (method_exists($model, "getPrivateProperties")) {
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
        $project = new LexProjectModel($projectId);
        $projectDto = LexProjectDtoEncoder::encode($project);

        $data = [];
        $data["project"] = [];
        $data["project"]["interfaceLanguageCode"] = $projectDto["interfaceLanguageCode"];
        $data["project"]["ownerRef"] = $projectDto["ownerRef"];
        $data["project"]["audioRecordingCodec"] = $projectDto["audioRecordingCodec"];
        $data["project"]["whenToConvertAudio"] = $projectDto["whenToConvertAudio"];
        $data["project"]["projectCode"] = $projectDto["projectCode"];
        $data["project"]["featured"] = $projectDto["featured"];
        if ($project->hasSendReceive()) {
            $data["project"]["sendReceive"] = [];
            $data["project"]["sendReceive"]["project"] = $projectDto["sendReceiveProject"];
            $data["project"]["sendReceive"]["project"]["identifier"] = $projectDto["sendReceiveProjectIdentifier"];
        }

        return $data;
    }
}
