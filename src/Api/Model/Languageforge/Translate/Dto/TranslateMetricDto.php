<?php

namespace Api\Model\Languageforge\Translate\Dto;

use Api\Model\Languageforge\Translate\TranslateDocumentSetModel;
use Api\Model\Languageforge\Translate\TranslateMetricModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use GeoIp2\Database\Reader;
use GeoIp2\Exception\AddressNotFoundException;

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
    const GEO_CITY_DB_FILE_PATH = '/usr/share/GeoIP/GeoLite2-City.mmdb';

    public static function encode(TranslateMetricModel $metric, ProjectModel $project, $isTestData = false): array
    {
        $data = TranslateMetricDtoEncoder::encodeModel($metric, $project);
        unset($data['id']);
        $data['projectCode'] = $project->projectCode;
        $data['isTestData'] = $isTestData;

        $ipAddress = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
        $data['ipAddress'] = $ipAddress;
        try {
            $reader = new Reader(self::GEO_CITY_DB_FILE_PATH);
            $record = $reader->city($ipAddress);
            $data['geoCountryIsoCode'] = $record->country->isoCode;
            $data['geoLocation'] = [
                'lat' => $record->location->latitude,
                'lon' => $record->location->longitude
            ];
        } catch (AddressNotFoundException $e) {
            // ignore exceptions if the address in not found in production
            if ($isTestData && $ipAddress != '127.0.0.1') {
                throw new \Exception($e->getMessage(), $e->getCode(), $e);
            }
        } catch (\InvalidArgumentException $e) {
            // production code must have the Geo DB
            if (!$isTestData && $ipAddress) {
                throw new \Exception($e->getMessage(), $e->getCode(), $e);
            }
        }

        return $data;
    }
}
