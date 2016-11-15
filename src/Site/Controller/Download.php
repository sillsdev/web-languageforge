<?php

namespace Site\Controller;

use Silex\Application;

class Download extends Base
{
    public function assets(Application $app, $appName, $projectSlug, $filename) {
        $filePath = APPPATH."assets/$appName/$projectSlug/audio/".urldecode($filename);
        if (! file_exists($filePath)) {
            $filePath = APPPATH."assets/$appName/$projectSlug/".urldecode($filename);
            if (! file_exists($filePath)) {
                $app->abort(404, $this->website->base); // this terminates PHP

                return;
            }
        }
        // remove datetimestamp prefix if it exists
        $suggestedFilename = preg_replace('/^\d{14}_/', '', $filename);
        header('Content-type: octet/stream');
        header('Content-disposition: attachment; filename='.$suggestedFilename.';');
        header('Content-Length: '.filesize($filePath));
        readfile($filePath);
        exit;
    }

}
