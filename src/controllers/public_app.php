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

        $data = array();
        $data['appName'] = $app;
        $data['baseSite'] = $this->website->base;
        $data['appFolder'] = $appFolder;

        $data['jsFiles'] = array();
        self::addJavascriptFiles("angular-app/bellows/js", $data['jsFiles'], array('vendor/', 'assets/'));
        self::addJavascriptFiles ( "angular-app/bellows/directive", $data ['jsFiles'] );
        self::addJavascriptFiles($siteFolder . '/js', $data['jsFiles']);
        self::addJavascriptFiles($appFolder, $data['jsFiles'], array('vendor/', 'assets/'));

        // remove asset js files
        $data['jsNotMinifiedFiles'] = array();
        self::addJavascriptFiles("angular-app/bellows/js/vendor", $data['jsNotMinifiedFiles']);
        self::addJavascriptFiles("angular-app/bellows/js/assets", $data['jsNotMinifiedFiles']);
        self::addJavascriptFiles($appFolder . "/js/vendor", $data['jsNotMinifiedFiles']);
        self::addJavascriptFiles($appFolder . "/js/assets", $data['jsNotMinifiedFiles']);

        $data['cssFiles'] = array();
        self::addCssFiles("angular-app/bellows/css", $data['cssFiles']);
        self::addCssFiles($appFolder, $data['cssFiles']);

        $data['title'] = $this->website->name;
        $data['jsonSession'] = '"";'; // empty json session data that angular-app template needs to be happy

        $this->renderPage("angular-app", $data);
    }

    private static function ext($filename)
    {
        return pathinfo($filename, PATHINFO_EXTENSION);
    }

    private static function basename($filename)
    {
        return pathinfo($filename, PATHINFO_BASENAME);
    }

    private static function addJavascriptFiles($dir, &$result, $exclude = array())
    {
        self::addFiles('js', $dir, $result, $exclude);
    }

    private static function addCssFiles($dir, &$result)
    {
        self::addFiles('css', $dir, $result, array());
    }

    private static function addFiles($ext, $dir, &$result, $exclude)
    {
        if (is_dir($dir) && ($handle = opendir($dir))) {
            while ($file = readdir($handle)) {
                $filepath = $dir . '/' . $file;
                foreach ($exclude as $ex) {
                    if (strpos($filepath, $ex)) {
                        continue 2;
                    }
                }
                if (is_file($filepath)) {
                    if ($ext == 'js') {
                        /* For Javascript, check that file is not minified */
                        $base = self::basename($file);
                        //$isMin = (strpos($base, '-min') !== false) || (strpos($base, '.min') !== false);
                        $isMin = false;
                        if (!$isMin && self::ext($file) == $ext) {
                            $result[] = $filepath;
                        }
                    } else {
                        if (self::ext($file) == $ext) {
                            $result[] = $filepath;
                        }
                    }
                } elseif ($file != '..' && $file != '.') {
                    self::addFiles($ext, $filepath, $result, $exclude);
                }
            }
            closedir($handle);
        }
    }
}
