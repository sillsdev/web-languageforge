<?php

namespace Site\Controller;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class PublicApp extends Base
{
    public function view(Request $request, Application $app, $appName) {
        $this->setupNgView($app, $appName);

        return $this->renderPage($app, 'angular-app');
    }

    public function setupNgView(Application $app, $appName) {
        $siteFolder = NG_BASE_FOLDER.$this->website->base;
        $appFolder = $this->website->base.'/public/'.$appName;
        if (! file_exists(NG_BASE_FOLDER.$appFolder)) {
            $appFolder = 'bellows/apps/public/'.$appName;
            if (! file_exists(NG_BASE_FOLDER.$appFolder)) {
                $app->abort(404, $this->website->base); // this terminates PHP
            }
        }

        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appFolder;
        $this->data['useMinifiedJs'] = SF_USE_MINIFIED_JS;

        $this->addJavascriptFiles(NG_BASE_FOLDER.'bellows/js', array('vendor/', 'assets/'));
        $this->addJavascriptFiles(NG_BASE_FOLDER.'bellows/directive');
        $this->addJavascriptFiles($siteFolder.'/js');
        $this->addJavascriptFiles(NG_BASE_FOLDER.$appFolder, array('vendor/', 'assets/'));

        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER.'bellows/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER.'bellows/js/assets');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER.$appFolder.'/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER.$appFolder.'/js/assets');

        $this->addCssFiles(NG_BASE_FOLDER.'bellows/css');
        $this->addCssFiles(NG_BASE_FOLDER.$appFolder);

        $this->data['jsonSession'] = '"";'; // empty json session data that angular-app template needs to be happy
    }
}
