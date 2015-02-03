<?php

require_once 'base.php';

class download extends Base
{
    public function assets($appName, $projectSlug, $file)
    {
        $filePath = APPPATH .  "assets/$appName/$projectSlug/" . urldecode($file);
        if (!file_exists($filePath)) {
            show_404($this->site);

            return;
        }
        header("Content-type: octet/stream");
        header("Content-disposition: attachment; filename=" . $file . ";");
        header("Content-Length: ".filesize($filePath));
        readfile($filePath);
        exit;
    }

}
