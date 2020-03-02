<?php

namespace Api\Model\Shared\Translate\Dto;

use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Translate\TranslateDocumentSetModel;
use Api\Model\Shared\Translate\TranslateMetricModel;
use Api\Model\Shared\UserModel;

class TranslateMetricDtoEncoder extends JsonEncoder
{
    public function __construct(ProjectModel $project)
    {
        $this->project = $project;
    }

    /** @var ProjectModel */
    private $project;

    public function encodeIdReference(&$key, $model)
    {
        if ($key == 'userRef') {
            $key = 'user';
            $user = new UserModel();
            if ($user->readIfExists($model->asString())) {
                return [
                    'id' => $user->id->asString(),
                    'username' => $user->username
                ];
            } else {
                return '';
            }
        } elseif ($key == 'documentSetIdRef') {
            $key = 'documentSet';
            $documentSet = new TranslateDocumentSetModel($this->project);
            if ($documentSet->readIfExists($model->asString())) {
                return [
                    'id' => $documentSet->id->asString(),
                    'name' => $documentSet->name
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
        throw new \Exception('use "encodeModel" method');
    }

    // Not using encode method because we need the additional $project argument
    public static function encodeModel($model, ProjectModel $project): array
    {
        $encoder = new TranslateMetricDtoEncoder($project);
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

class TranslateMetricDto
{

    public static function encode(TranslateMetricModel $metric, ProjectModel $project, $isTestData = false): array
    {
        $data = TranslateMetricDtoEncoder::encodeModel($metric, $project);
        unset($data['id']);
        $data['projectCode'] = $project->projectCode;
        $data['isTestData'] = $isTestData;

        $ipAddress = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
        $data['ipAddress'] = $ipAddress;

        return $data;
    }
}
