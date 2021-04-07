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
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Acl\Exception\Exception;

class Base
{
    public function __construct() {
        $this->website = Website::get();
        $this->_appName = '';
        $this->data['isAdmin'] = false;
        $this->data['projects'] = [];
        $this->data['smallAvatarUrl'] = '';
        $this->data['userName'] = '';
        $this->data['version'] = VERSION;
        $this->data['useMinifiedJs'] = true;
        $this->data['http_host'] = $_SERVER['HTTP_HOST'];

        $this->data['jsFiles'] = [];
        $this->data['jsNotMinifiedFiles'] = [];
        $this->data['cssFiles'] = [];
        $this->data['vendorFilesJs'] = [];
        $this->data['vendorFilesCss'] = [];
        $this->data['vendorFilesMinJs'] = [];
        $this->data['isAngular2'] = false;
        $this->data['themeColor'] = '';
    }

    /** @var array data used to render templates */
    public $data;

    /** @var Website */
    public $website;

    /** @var boolean */
    protected $_isLoggedIn;

    /** @var UserModel */
    protected $_user;

    /** @var string */
    protected $_userId;

    /** @var string */
    protected $_projectId;

    /** @var string */
    protected $_appName;

    /**
     * all child classes should call this method first to setup base variables
     *
     * @param Application $app
     * @throws Exception Of unknown type or origin. Try/catch extracted to calling functions July 2019.
     */
    protected function setupBaseVariables(Application $app) {
        $this->_isLoggedIn = $this->isLoggedIn($app);
        $this->data['isLoggedIn'] = $this->_isLoggedIn;
        if ($this->_isLoggedIn) {
            $this->_userId = SilexSessionHelper::getUserId($app);

            if ($this->_userId) {
                $this->_user = new UserModel($this->_userId);
            } /** @noinspection PhpStatementHasEmptyBodyInspection */ else {
                //TODO: load anonymous user here
            }
        }

        return null;
    }

    /**
     * all child classes should use this method to render their pages
     *
     * @param Application $app
     * @param $viewName
     * @return Response
     * @throws \Exception
     */
    protected function renderPage(Application $app, $viewName) {
        // TODO: move to app_dependencies once bootstrap4 migration is complete
        $sassDir = $this->getThemePath() . '/sass';
        if (!file_exists($sassDir)) {
            $sassDir = $this->getThemePath('default') . '/sass';
        }
        $this->addCssFiles($sassDir, [], false);

        $this->addJavascriptFiles('angular-app/bellows/_js_module_definitions');
        $this->addJavascriptFiles('angular-app/bellows/js', ['vendor', 'assets']);
        $this->addJavascriptFiles('angular-app/bellows/directive');

        // Add general Angular app dependencies
        $dependencies = $this->getAngularAppDependencies();
        foreach ($dependencies['js'] as $dependencyFilePath) {
            $this->data['vendorFilesJs'][] = $dependencyFilePath;
        }
        foreach ($dependencies['min'] as $dependencyFilePath) {
            $this->data['vendorFilesMinJs'][] = $dependencyFilePath;
        }
        foreach ($dependencies['css'] as $dependencyFilePath) {
            $this->data['vendorFilesCss'][] = $dependencyFilePath;
        }

        $this->data['faviconPath'] = $this->getFilePath('image/favicon.ico');

        $this->data['manifestFilename'] = '';
        if (file_exists('appManifest/' . $this->website->base . '.manifest.json')) {
            $this->data['manifestFilename'] = $this->website->base . '.manifest.json';
        }
        $this->data['themeColor'] = '#0a2440';

        $this->populateHeaderMenuViewdata();
        $this->data['useCdn'] = true;

        if (empty($this->data)) {
            $app->abort(404, 'Error: cannot render without data');
        }

        try {
            return $app['twig']->render($viewName.'.html.twig', $this->data);
        } catch (\Twig\Loader\ErrorLoader $e) {
            $app->abort(404, "Page not found: $viewName.twig\n" . $e->getMessage() . "\n" . $e->getTraceAsString());
        }

        return new Response('Should not get here', 500);
    }

    protected function populateHeaderMenuViewdata() {
        $this->data['isAdmin'] = false;

        // setup specific variables for header
        $this->data['isLoggedIn'] = $this->_isLoggedIn;

        $featuredProjectList = new FeaturedProjectListModel();
        $featuredProjectList->read();
        $this->data['featuredProjects'] = $featuredProjectList->entries;

        if ($this->_isLoggedIn) {
            if ($this->_user->role) {
                $this->data['isAdmin'] = SystemRoles::hasRight($this->_user->role, Domain::USERS + Operation::CREATE);
            }
            $this->data['userName'] = $this->_user->username;
            $this->data['userId'] = $this->_userId;
            if ($this->_user->avatar_ref && substr($this->_user->avatar_ref, 0, 4) === 'http')
            {
                $this->data['smallAvatarUrl'] = $this->_user->avatar_ref;
            } else {
                $this->data['smallAvatarUrl'] = '/Site/views/shared/image/avatar/' . $this->_user->avatar_ref;
            }
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

    /**
     * @param string $filename
     * @return string
     * @throws \Exception
     */
    protected function getFilePath(string $filename) {
        $themePath = $this->getThemePath();
        $filePath = $themePath . DIRECTORY_SEPARATOR . $filename;
        if (!file_exists($filePath)) {
            $themePath = $this->getThemePath('default');
            $filePath = $themePath . DIRECTORY_SEPARATOR . $filename;
            if (!file_exists($filePath)) {
                throw new \Exception(__FILE__ . ' - filename doesn\'t exist: ' . $filename);
            }
        }
        return DIRECTORY_SEPARATOR . $filePath;
    }

    protected function addJavascriptFilesToBeMinified($folder, $exclude = []) {
        self::addFiles('js', $folder, $this->data['jsFiles'], $exclude, true);
    }

    protected function addJavascriptFilesNotMinified($folder, $exclude = []) {
        self::addFiles('js', $folder, $this->data['jsNotMinifiedFiles'], $exclude, true);
    }

    protected function addJavascriptFiles($folder, $excludedFromMinification = []) {
        $this->addJavascriptFilesToBeMinified($folder, $excludedFromMinification);
        foreach ($excludedFromMinification as $excludeFolder) {
            $notMinifiedPath = "$folder/$excludeFolder";
            $this->addJavascriptFilesNotMinified($notMinifiedPath);
        }
    }

    protected function addCssFiles($dir, $exclude = [], $atEnd = true) {
        self::addFiles('css', $dir, $this->data['cssFiles'], $exclude, $atEnd);
    }

    private static function ext($filename) {
        return pathinfo($filename, PATHINFO_EXTENSION);
    }

    private static function addFiles($ext, $dir, &$result, $exclude, $atEnd) {
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
                        if ($atEnd) {
                            array_push($result, $filepath);
                        } else {
                            array_unshift($result, $filepath);
                        }
                    }
                } elseif ($file != '..' && $file != '.') {
                    self::addFiles($ext, $filepath, $result, $exclude, $atEnd);
                }
            }
        }
    }

    /**
     * Reads the app_dependencies.json file and creates a structure for use in the controller above
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
    protected function getAngularAppDependencies() {
        /* TODO: This is an Angular1 function; rename appropriately. */
        $jsonData = json_decode(file_get_contents(APPPATH . "app_dependencies.json"), true);
        $jsFilesToReturn = [];
        $jsMinFilesToReturn = [];
        $cssFilesToReturn = [];

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
                        $file = "$path/$file";
                    } else {
                        $file = "$path/$file.js";
                    }
                    if (file_exists($file)) {
                        $jsFilesToReturn[] = $file;
                    }
                }
            } elseif (file_exists("$path/$itemName.js")) {
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
                    } elseif (file_exists("$path/$file.min.js")) {
                        $jsMinFilesToReturn[] = "$path/$file.min.js";
                    } else {
                        $jsMinFilesToReturn[] = "$path/$file.js";
                    }
                }
            } elseif (array_key_exists("cssFile", $properties)) {
                // don't add any min files because this contains a css key

            } else {
                $jsMinFilesToReturn[] = "$path/$itemName.min.js";
            }

            // process CSS Files
            if (array_key_exists("cssFile", $properties)) {
                $cssFile = $properties["cssFile"];
                if (!is_array($cssFile)) {
                    $cssFile = [$cssFile];
                }
                foreach ($cssFile as $file) {
                    if (StringUtil::endsWith($file, '.css')) {
                        $cssFilesToReturn[] = "$path/$file";
                    } else {
                        $cssFilesToReturn[] = "$path/$file.css";
                    }
                }
            }
        }
        foreach (array_merge($jsFilesToReturn, $jsMinFilesToReturn, $cssFilesToReturn) as $file) {
            if (!file_exists($file)) {
                throw new Exception("This app depends upon $file and the file doesn't exist!");
            }
        }
        return ["js" => $jsFilesToReturn, "min" => $jsMinFilesToReturn, "css" => $cssFilesToReturn];
    }

}
