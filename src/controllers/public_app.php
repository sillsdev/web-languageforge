<?php

require_once 'base.php';

class Public_app extends Base
{
    public function view($app = 'main')
    {
        $siteFolder = "angular-app/" . $this->website->base;
        $appFolder = $siteFolder . "/public/$app";
        if (!file_exists($appFolder)) {
            $appFolder = "angular-app/bellows/apps/public/$app";
            if (!file_exists($appFolder)) {
                show_404($this->website->base); // this terminates PHP
            }
        }

        $this->data['appName'] = $app;
        $this->data['baseSite'] = $this->website->base;
        $this->data['appFolder'] = $appFolder;

        $this->addJavascriptFiles("angular-app/bellows/js", array('vendor/', 'assets/'));
        $this->addJavascriptFiles("angular-app/bellows/directive");
        $this->addJavascriptFiles($siteFolder . '/js');
        $this->addJavascriptFiles($appFolder, array('vendor/', 'assets/'));

        $this->addJavascriptNotMinifiedFiles("angular-app/bellows/js/vendor");
        $this->addJavascriptNotMinifiedFiles("angular-app/bellows/js/assets");
        $this->addJavascriptNotMinifiedFiles($appFolder . "/js/vendor");
        $this->addJavascriptNotMinifiedFiles($appFolder . "/js/assets");

        $this->addCssFiles("angular-app/bellows/css");
        $this->addCssFiles($appFolder);

        $this->data['jsonSession'] = '"";'; // empty json session data that angular-app template needs to be happy

        $this->renderPage("angular-app");
    }

}
