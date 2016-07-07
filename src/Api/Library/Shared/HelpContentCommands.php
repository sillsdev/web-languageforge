<?php
/**
 * Created by PhpStorm.
 * User: chris
 * Date: 7/1/16
 * Time: 10:17 AM
 */

namespace Api\Library\Shared;

use Api\Library\Shared\Website;


class HelpContentCommands
{
    /**
     * @param Website $website
     * @param $urlPath - the first part of the URL e.g. /app/lexicon/1234567890
     * @param $hashPath - the part of the URL after the hash (including the hash) e.g. "#/dbe"
     * @return bool
     */
    public static function canShowPageHelpButton($website, $urlPath, $hashPath) {
        $appName = '';
        if (preg_match("@/app/([^/]+)@i", $urlPath, $matches)) {
            $appName = $matches[1];
        }
        $hashPath = ltrim($hashPath, '#');
        $hashPath = rtrim($hashPath, '/');
        $hashPath = str_replace('/', '-', $hashPath);

        $result = array('showButton' => false, 'helpFilePath' => '');

        // right now we only support help pages for /app/[appName] 
        if ($appName) {
            $pathToHelpFile = $website->getAngularPath($appName) . "/helps/en/page/$appName";
            if ($hashPath) {
                $pathToHelpFile .= $hashPath;
            }
            $pathToHelpFile .= ".html";
            if (file_exists($pathToHelpFile)) {
                $result['showButton'] = true;
                $result['helpFilePath'] = "/$pathToHelpFile";
            }
        }

        return $result;
    }

    /**
     * @param $appName string
     * @param $website Website
     * @return array
     */
    public static function getSessionData($appName, $website) {
        $rootFolder = $website->getAngularPath($appName) . "/helps";
        $result = array('filePaths' => array());

        if (file_exists($rootFolder)) {
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($rootFolder, \RecursiveDirectoryIterator::SKIP_DOTS)) as $file) {
                $filepath = $file->getPathname();
                if (strpos($filepath, '.html') > -1) {
                    array_push($result['filePaths'], $file->getPathname());
                }
            }
        }

        return $result;
    }

}