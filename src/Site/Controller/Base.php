<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\FeaturedProjectListModel;
use Api\Model\UserModel;
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
        $this->data['http_host'] = $_SERVER['HTTP_HOST'];

        $this->data['jsFiles'] = array();
        $this->data['jsNotMinifiedFiles'] = array();
        $this->data['cssFiles'] = array();

        $this->addCssFiles("Site/views/shared/css");
        $this->addCssFiles($this->getThemePath()."/css");
    }

    /**
     * data used to render templates
     * @var array
     */
    public $data;

    /**
     * @var Website
     */
    public $website;

    /**
     * Variable used to control visibility of help button in header menu bar
     * @var bool
     */
    protected $_showHelp;

    /**
     * @var bool
     */
    protected $_isLoggedIn;

    /**
     * @var UserModel
     */
    protected $_user;

    /**
     * @var string
     */
    protected $_userId;

    /**
     * @var string
     */
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
}
