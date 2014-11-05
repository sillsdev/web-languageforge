<?php
namespace models;

use Palaso\Utilities\CodeGuard;


class ProjectModelFixer
{
    /**
     * @var ProjectModel
     */
    public $projectModel;

    /**
     * @var bool
     */
    public $wasFixed;

    /**
     * @param ProjectModel $projectModel
     */
    public function __construct($projectModel)
    {
        CodeGuard::checkTypeAndThrow($projectModel, 'models\ProjectModel');
        $this->projectModel = $projectModel;
    }

    public static function ensureVLatest($projectModel)
    {
        $fixer = new ProjectModelFixer($projectModel);

        $fixer->ensureV01();

        if ($fixer->wasFixed) {
            $fixer->projectModel->write();
        }
    }

    private function ensureV01()
    {
        $model = $this->projectModel;
        // Disabled all but projectName until we can implement them properly. 2014-09-04 RM
        //$this->ensureHasProjectSlug();
        $this->ensureHasProjectName();
        //$this->ensureHasLanguageCode();
        //$this->ensureHasProjectType();
    }

    private function ensureHasProjectSlug()
    {
        $model = $this->projectModel;
        if (!empty($model->projectSlug)) {
            return;
        }
        $this->ensureHasProjectName();
        $this->ensureHasLanguageCode();
        $this->ensureHasProjectType();
        $model->projectSlug = ProjectModel::makeProjectSlug($model->languageCode, $model->projectName, $model->projectType);
        error_log(sprintf("Fixed ProjectModel::projectSlug %s = %s", $model->id->asString(), $model->projectSlug));
        $this->wasFixed = true;
    }

    private function ensureHasProjectName()
    {
        $model = $this->projectModel;
        if (!empty($model->projectName)) {
            return;
        }
        $model->projectName = 'Unknown Project';
        error_log(sprintf("Fixed ProjectModel::projectName %s = %s", $model->id->asString(), $model->projectName));
        $this->wasFixed = true;
    }

    private function ensureHasLanguageCode()
    {
        $model = $this->projectModel;
        if (!empty($model->languageCode)) {
            return;
        }
//         if (!empty($model->config)) {
//             $model->languageCode = $model->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems[0];
//         } else {
            $model->languageCode = 'qaa';
//         }
        error_log(sprintf("Fixed ProjectModel::languageCode %s = %s", $model->id->asString(), $model->languageCode));
        $this->wasFixed = true;
    }

    private function ensureHasProjectType()
    {
        $model = $this->projectModel;
        if (!empty($model->projectType)) {
            return;
        }
        $model->projectType = ProjectModel::PROJECT_LIFT;
        error_log(sprintf("Fixed ProjectModel::projectType %s = %s", $model->id->asString(), $model->projectType));
        $this->wasFixed = true;
    }
}
