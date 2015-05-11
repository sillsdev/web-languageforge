<?php

namespace models\languageforge\semdomtrans\dto;


use models\languageforge\LfProjectModel;
use models\languageforge\SemDomTransProjectModel;
use models\ProjectListModel;

class SemDomTransAppManagementDto {

    public static function encode() {
        $data = array();

        $listModel = new ProjectListModel();
        $listModel->read();

        $projects = array();
        foreach($listModel->entries as $p) {
            $project = new SemDomTransProjectModel($p["id"]);
            if ($project->appName == LfProjectModel::SEMDOMTRANS_APP && $project->languageIsoCode != "en") {
                $projects[] = array('name' => $project->languageIsoCode, 'id' => $p['id']);
            }
        }

        $data['languages'] = $projects;

        return $data;

    }

}