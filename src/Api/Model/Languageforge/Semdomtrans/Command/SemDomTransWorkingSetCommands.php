<?php

namespace Api\Model\Languageforge\Semdomtrans\Command;

use Api\Model\Languageforge\Semdomtrans\SemDomTransWorkingSetModel;
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Model\Mapper\JsonDecoder;

class SemDomTransWorkingSetCommands
{
    /**
     * Updates semantic domain working set
     * @param array $data
     * @param string $projectId
     * @return string
     */
    public static function update($data, $projectId) {
        $projectModel = new SemDomTransProjectModel($projectId);
        
        $s = new SemDomTransWorkingSetModel($projectModel);
        JsonDecoder::decode($s, $data);
        $s->write();
        return $s->id->asString();
    }
}
