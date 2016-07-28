<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Command\SessionCommands;
use Api\Model\ProjectModel;
use Api\Model\UserModel;
use Silex\Application;

class App extends Base
{
    public function view(Application $app, $appName, $projectId = '') {
        $this->setupNgView($app, $appName, $projectId);

        return $this->renderPage($app, 'angular-app');
    }

    public function setupNgView(Application $app, $appName, $projectId = '')
    {
        $siteFolder = NG_BASE_FOLDER . $this->website->base;
        $parentAppFolder = '';
        $appFolder = $this->website->base . '/' . $appName;

        if ($projectId == 'favicon.ico') {
            $projectId = '';
        }

        $possibleSubFolder = "$siteFolder/$appName/$projectId";
        if ($projectId != '' && file_exists($possibleSubFolder) && file_exists("$possibleSubFolder/ng-app.html") && file_exists("$possibleSubFolder/views")) {
            $parentAppFolder = $appFolder;
            $appFolder .= "/$projectId";
            $appName .= "-$projectId";
            $projectId = '';
        }

        if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
            $appFolder = 'bellows/apps/' . $appName;
            if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
                $app->abort(404, $this->website->base); // this terminates PHP
            }
        }

        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appFolder;
        $this->data['useMinifiedJs'] = USE_MINIFIED_JS;

        $this->_userId = SilexSessionHelper::getUserId($app);

        // update the projectId in the session if it is not empty
        if (!$projectId) {
            $projectId = SilexSessionHelper::getProjectId($app, $this->website);
        }
        if ($projectId && ProjectModel::projectExists($projectId)) {
            $projectModel = ProjectModel::getById($projectId);
            if (!$projectModel->userIsMember($this->_userId)) {
                $projectId = '';
            } else {
                $user = new UserModel($this->_userId);
                $user->lastUsedProjectId = $projectId;
                $user->write();
            }
        } else {
            $projectId = '';
        }
        $app['session']->set('projectId', $projectId);
        $this->_projectId = $projectId;

        // Add general Angular app dependencies
        $dependencies = $this->getAngularAppJsDependencies();
        foreach ($dependencies["js"] as $dependencyFilePath) {
            $this->data['vendorFilesJs'][] = $dependencyFilePath;
        }
        foreach ($dependencies["min"] as $dependencyFilePath) {
            $this->data['vendorFilesMinJs'][] = $dependencyFilePath;
        }


        // determine help menu button visibility
        // placeholder for UI language 'en' to support translation of helps in the future
        $helpsFolder = NG_BASE_FOLDER . $appFolder . "/helps/en/page";
        if (file_exists($helpsFolder) && iterator_count(new \FilesystemIterator($helpsFolder, \FilesystemIterator::SKIP_DOTS)) > 0) {
            $this->_showHelp = true;
            // there is an implicit dependency on bellows JS here using the jsonRpc module
            $this->addJavascriptFiles(NG_BASE_FOLDER . 'container/js', array('vendor/', 'assets/'));
        }

        // Other session data
        $sessionData = SessionCommands::getSessionData($this->_projectId, $this->_userId, $this->website, $appName);
        $this->data['jsonSession'] = json_encode($sessionData, JSON_UNESCAPED_SLASHES);

        $this->addJavascriptFiles(NG_BASE_FOLDER . 'bellows/js', array('vendor/', 'assets/'));
        $this->addJavascriptFiles(NG_BASE_FOLDER . 'bellows/directive');
        $this->addJavascriptFiles($siteFolder . '/js', array('vendor/', 'assets/'));
        if ($parentAppFolder) {
            $this->addJavascriptFiles(NG_BASE_FOLDER . $parentAppFolder, array('vendor/', 'assets/'));
            $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $parentAppFolder . '/js/vendor');
            $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $parentAppFolder . '/js/assets');
        }
        $this->addJavascriptFiles(NG_BASE_FOLDER . $appFolder, array('vendor/', 'assets/'));

        if ($appName == 'semdomtrans' || $appName == 'semdomtrans-new-project') {
            // special case for semdomtrans app
            // add lexicon JS files since the semdomtrans app depends upon these JS files
            $this->addJavascriptFiles($siteFolder . '/lexicon', array('vendor/', 'assets/'));
        }

        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . 'bellows/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . 'bellows/js/assets');
        $this->addJavascriptNotMinifiedFiles($siteFolder . '/js/vendor');
        $this->addJavascriptNotMinifiedFiles($siteFolder . '/js/assets');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $appFolder . '/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $appFolder . '/js/assets');

        $this->addCssFiles(NG_BASE_FOLDER . 'bellows');
        $this->addCssFiles(NG_BASE_FOLDER . $appFolder);



    }

    /**
     * Reads the js_dependencies.json file and creates a structure for use in the controller above
     *
     * The format of a line in the JSON is expected to be:
     * "itemName": {"path": "folderPath"}
     *
     * Additional properties could be:
     * "jsFile" as a string or an array
     * "jsMinFile" as a string or an array
     *
     * if jsFile is absent, then "itemName" is used as the filename
     * if jsMinFile is absent, then jsFile or "itemName is used as the min filename
     *
     * @return array
     */
    private function getAngularAppJsDependencies() {
        $jsonData = json_decode(file_get_contents(APPPATH . "js_dependencies.json"), true);
        $jsFilesToReturn = array();
        $jsMinFilesToReturn = array();
        foreach ($jsonData as $itemName => $properties) {
            $path = $properties["path"];

            // process regular JS files
            if (array_key_exists("jsFile", $properties)) {
                $jsFile = $properties["jsFile"];
                if (is_array($jsFile)) {
                    foreach ($jsFile as $file) {
                        $jsFilesToReturn[] = "$path/$file.js";
                    }
                } else {
                    $jsFilesToReturn[] = "$path/$jsFile.js";
                }
            } else {
                $jsFilesToReturn[] = "$path/$itemName.js";
            }

            // process minified JS files
            if (array_key_exists("jsMinFile", $properties)) {
                $jsMinFile = $properties["jsMinFile"];
                if (is_array($jsMinFile)) {
                    foreach ($jsMinFile as $file) {
                        $jsMinFilesToReturn[] = "$path/$file.min.js";
                    }
                } else {
                    $jsMinFilesToReturn[] = "$path/$jsMinFile.min.js";
                }
            } elseif (array_key_exists("jsFile", $properties)) {
                $jsMinFile = $properties["jsFile"];
                if (is_array($jsMinFile)) {
                    foreach ($jsMinFile as $file) {
                        $jsMinFilesToReturn[] = "$path/$file.min.js";
                    }
                } else {
                    $jsMinFilesToReturn[] = "$path/$jsMinFile.min.js";
                }
            } else {
                $jsMinFilesToReturn[] = "$path/$itemName.min.js";
            }

        }
        return array("js" => $jsMinFilesToReturn, "min" => $jsMinFilesToReturn);
    }

}
