<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Shared\FeaturedProjectListModel;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\Response;

require_once APPPATH."version.php";

class Base
{
    public function __construct() {
        $this->website = Website::get();
        $this->_isLoggedIn = false;
        $this->_showHelp = false;
        $this->data['isLoggedIn'] = $this->_isLoggedIn;
        $this->data['isAdmin'] = false;
        $this->data['projects'] = array();
        $this->data['smallAvatarUrl'] = '';
        $this->data['userName'] = '';
        $this->data['version'] = VERSION;
        $this->data['useMinifiedJs'] = USE_MINIFIED_JS;
        $this->data['http_host'] = $_SERVER['HTTP_HOST'];

        $this->data['jsFiles'] = array();
        $this->data['jsNotMinifiedFiles'] = array();
        $this->data['cssFiles'] = array();
        $this->data['vendorFilesJs'] = array();
        $this->data['vendorFilesMinJs'] = array();

        $this->addCssFiles("Site/views/shared/css");
        $this->addCssFiles($this->getThemePath()."/css");
    }

    /** @var array data used to render templates */
    public $data;

    /** @var Website */
    public $website;

    /** @var boolean Variable used to control visibility of help button in header menu bar */
    protected $_showHelp;

    /** @var boolean */
    protected $_isLoggedIn;

    /** @var UserModel */
    protected $_user;

    /** @var string */
    protected $_userId;

    /** @var string */
    protected $_projectId;

    // all child classes should use this method to render their pages
    protected function renderPage(Application $app, $viewName) {
        if ($viewName == 'favicon.ico') {
            $viewName = 'container';
        }

        $this->_isLoggedIn = $this->isLoggedIn($app);
        if ($this->_isLoggedIn) {
            try {
                if (!$this->_userId) {
                    $this->_userId = SilexSessionHelper::getUserId($app);
                }
                $this->_user = new UserModel($this->_userId);
                if (!$this->_projectId) {
                    $this->_projectId = SilexSessionHelper::getProjectId($app, $this->website);
                }
            } catch (\Exception $e) {
//                error_log("User $userId not found, logged out.\n" . $e->getMessage());
                return $app->redirect('/app/logout');
            }
        }

        // Add general Angular app dependencies
        $dependencies = $this->getAngularAppJsDependencies();
        foreach ($dependencies["js"] as $dependencyFilePath) {
            $this->data['vendorFilesJs'][] = $dependencyFilePath;
        }
        foreach ($dependencies["min"] as $dependencyFilePath) {
            $this->data['vendorFilesMinJs'][] = $dependencyFilePath;
        }

        $this->populateHeaderMenuViewdata();
        $this->data['useCdn'] = USE_CDN;

        if (empty($this->data)) {
            $app->abort(404, 'Error: cannot render without data');
        }

        try {
            return $app['twig']->render($viewName.'.html.twig', $this->data);
        } catch (\Twig_Error_Loader $e) {
            $app->abort(404, "Page not found: $viewName.twig");
        }

        return new Response('Should not get here', 500);
    }

    protected function populateHeaderMenuViewdata() {
        $this->data['isAdmin'] = false;

        // setup specific variables for header
        $this->data['isLoggedIn'] = $this->_isLoggedIn;
        $this->data['showHelpButton'] = $this->_showHelp;

        $featuredProjectList = new FeaturedProjectListModel();
        $featuredProjectList->read();
        $this->data['featuredProjects'] = $featuredProjectList->entries;

        if ($this->_isLoggedIn) {
            if ($this->_user->role) {
                $this->data['isAdmin'] = SystemRoles::hasRight($this->_user->role, Domain::USERS + Operation::CREATE);
            }
            $this->data['userName'] = $this->_user->username;
            $this->data['smallAvatarUrl'] = '/Site/views/shared/image/avatar/'.$this->_user->avatar_ref;
            $projects = $this->_user->listProjects($this->website->domain);
            $this->data['projects_count'] = $projects->count;
            $this->data['projects'] = $projects->entries;
        }
    }

    /**
     * @param Application $app
     * @return mixed
     */
    protected function isLoggedIn(Application $app)
    {
        return $app['security.authorization_checker']->isGranted('IS_AUTHENTICATED_REMEMBERED');
    }

    protected function getThemePath($theme = "") {
        if (! $theme) {
            $theme = $this->website->theme;
        }
        if (! file_exists('Site/views/'.$this->website->base.'/theme/'.$theme)) {
            $theme = 'default';
        }

        return 'Site/views/'.$this->website->base.'/theme/'.$theme;
    }

    protected function addJavascriptFiles($dir, $exclude = array()) {
        self::addFiles('js', $dir, $this->data['jsFiles'], $exclude);
    }

    protected function addJavascriptNotMinifiedFiles($dir, $exclude = array()) {
        self::addFiles('js', $dir, $this->data['jsNotMinifiedFiles'], $exclude);
    }

    protected function addCssFiles($dir) {
        self::addFiles('css', $dir, $this->data['cssFiles'], array());
    }

    private static function ext($filename) {
        return pathinfo($filename, PATHINFO_EXTENSION);
    }

    private static function addFiles($ext, $dir, &$result, $exclude) {
        array_push($exclude, 'excluded/');
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file) {
                $filepath = $dir . '/' . $file;
                foreach ($exclude as $ex) {
                    if (strpos($filepath, $ex)) {
                        continue 2;
                    }
                }
                if (is_file($filepath)) {
                    if (self::ext($file) == $ext) {
                        $result[] = $filepath;
                    }
                } elseif ($file != '..' && $file != '.') {
                    self::addFiles($ext, $filepath, $result, $exclude);
                }
            }
        }
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
    protected function getAngularAppJsDependencies() {
        $jsonData = json_decode(file_get_contents(APPPATH . "js_dependencies.json"), true);
        $jsFilesToReturn = array();
        $jsMinFilesToReturn = array();
        foreach ($jsonData as $itemName => $properties) {
            $path = $properties["path"];

            // process regular JS files
            if (array_key_exists("jsFile", $properties)) {
                $jsFile = $properties["jsFile"];
                if (!is_array($jsFile)) {
                    $jsFile = [$jsFile];
                }
                foreach ($jsFile as $file) {
                    if (StringUtil::endsWith($file, '.js')) {
                        $jsFilesToReturn[] = "$path/$file";
                    } else {
                        $jsFilesToReturn[] = "$path/$file.js";
                    }
                }
            } else {
                $jsFilesToReturn[] = "$path/$itemName.js";
            }

            // process minified JS files
            if (array_key_exists("jsMinFile", $properties)) {
                $jsMinFile = $properties["jsMinFile"];
                if (!is_array($jsMinFile)) {
                    $jsMinFile = [$jsMinFile];
                }
                foreach ($jsMinFile as $file) {
                    if (StringUtil::endsWith($file, '.js')) {
                        $jsMinFilesToReturn[] = "$path/$file";
                    } else {
                        $jsMinFilesToReturn[] = "$path/$file.min.js";
                    }
                }
            } elseif (array_key_exists("jsFile", $properties)) {
                $jsMinFile = $properties["jsFile"];
                if (!is_array($jsMinFile)) {
                    $jsMinFile = [$jsMinFile];
                }
                foreach ($jsMinFile as $file) {
                    if (StringUtil::endsWith($file, '.js')) {
                        $jsMinFilesToReturn[] = "$path/$file";
                    } else {
                        $jsMinFilesToReturn[] = "$path/$file.min.js";
                    }
                }
            } else {
                $jsMinFilesToReturn[] = "$path/$itemName.min.js";
            }

        }
        return array("js" => $jsFilesToReturn, "min" => $jsMinFilesToReturn);
    }
}
