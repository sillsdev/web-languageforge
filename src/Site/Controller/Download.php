<?php

namespace Site\Controller;

use Silex\Application;

class Download extends Base
{
    public function assets(Application $app, $appName, $projectSlug, $file) {
        $filePath = APPPATH."assets/$appName/$projectSlug/".urldecode($file);
        if (! file_exists($filePath)) {
            $app->abort(404, $this->website->base); // this terminates PHP

            return;
        }
        header('Content-type: octet/stream');
        header('Content-disposition: attachment; filename='.$file.';');
        header('Content-Length: '.filesize($filePath));
        readfile($filePath);
        exit;
    }

}
