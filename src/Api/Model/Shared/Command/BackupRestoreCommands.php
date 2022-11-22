<?php

namespace Api\Model\Shared\Command;

use Api\Model\Shared\ProjectModel;

class BackupRestoreCommands
{
    /**
     * @param ProjectModel $projectModel
     * @
     */
    public static function backupProject(ProjectModel $projectModel, string $pathToFolder)
    {
        $dbname = $projectModel->databaseName();

        $projectCollections = [""];
        exec("mongoexport --collection");

        // get the name of the mongodb

        // dump the database
    }
}
