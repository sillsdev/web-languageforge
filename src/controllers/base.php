<?php


use models\shared\rights\SystemRoles;
use libraries\shared\Website;
use models\FeaturedProjectListModel;
use models\shared\rights\Operation;
use models\shared\rights\Domain;

require_once APPPATH . "version.php";

class base extends CI_Controller
{
    protected $_isLoggedIn;

    protected $_user;
    protected $_userId;

    protected $_projectId;

    /**
     * @var Website
     */
    public $website;

    public function __construct()
    {
        parent::__construct();

        $website = Website::get();
        $this->load->library('ion_auth');
        $this->_isLoggedIn = $this->ion_auth->logged_in();
        if ($this->_isLoggedIn) {
            try {
                $userId = (string) $this->session->userdata('user_id');
                $this->_userId = $userId;
                $this->_user = new \models\UserModel($userId);
                $this->_projectId = (string) $this->session->userdata('projectId');
            } catch (Exception $e) {
                error_log("User $userId not found, logged out.\n" . $e->getMessage());
                $this->ion_auth->logout();
            }
        }
        $this->website = $website;
        $this->data['jsFiles'] = array();
        $this->data['jsNotMinifiedFiles'] = array();
        $this->data['cssFiles'] = array();

        $this->addCssFiles("css/shared");
        $cssThemePath = "css/" . $this->getThemePath();
        $this->addCssFiles($cssThemePath);
    }

    // all child classes should use this method to render their pages
    protected function renderPage($viewName, $render=true)
    {
        $this->data['controller'] = $this;
        $this->data['contentTemplate'] = $this->getContentTemplatePath($viewName);
        $this->data['themePath'] = $this->getThemePath();

        $this->populateHeaderMenuViewdata();

        $containerTemplatePath = $this->getSharedTemplatePath("container");

        return $this->load->view($containerTemplatePath, $this->data, !$render);
    }

    public function loadTemplate($templateName, $data = array()) {
        $templatePath = $this->getContentTemplatePath($templateName);
        if (file_exists(APPPATH . "views/" . $templatePath)) {
            if (empty($data)) {
                return $this->load->view($templatePath);
            } else {
                return $this->load->view($templatePath, $data);
            }
        }
    }

    protected function populateHeaderMenuViewdata()
    {
        $this->data['is_admin'] = false;

        // setup specific variables for header
        $this->data['logged_in'] = $this->_isLoggedIn;

        $featuredProjectList = new FeaturedProjectListModel();
        $featuredProjectList->read();
        $this->data['featuredProjects'] = $featuredProjectList->entries;

        if ($this->_isLoggedIn) {
            $isAdmin = SystemRoles::hasRight($this->_user->role, Domain::USERS + Operation::CREATE);
            $this->data['is_admin'] = $isAdmin;
            $this->data['user_name'] = $this->_user->username;
            $this->data['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
            $this->data['small_avatar_url'] = $this->_user->avatar_ref;
            $projects = $this->_user->listProjects($this->website->domain);
            $this->data['projects_count'] = $projects->count;
            $this->data['projects'] = $projects->entries;
        }
    }

    protected function getSharedTemplatePath($templateName)
    {
        $viewPath = "shared/$templateName.html.php";
        if (file_exists("views/$viewPath")) {
            return $viewPath;
        }

        return '';
    }

    protected function getThemePath($theme = "")
    {
        $themePath = $this->website->base;
        if (!$theme) {
            $theme = $this->website->theme;
        }

        if (file_exists("views/$themePath/$theme")) {
            $themePath .= "/$theme";
        } else {
            $themePath .= "/default";
        }
        return $themePath;
    }

    protected function getContentTemplatePath($templateName)
    {
        $sharedPath = $this->getSharedTemplatePath($templateName);
        if ($sharedPath != '') {
            return $sharedPath;
        } else {
            return $this->getProjectTemplatePath($templateName);
        }
    }

    protected function getProjectTemplatePath($templateName, $project = "")
    {
        $viewPath = $this->getThemePath() . "/$templateName.html.php";
        if (file_exists("views/$viewPath")) {
            return $viewPath;
        } else {
            // fallback to default theme
            $viewPath = $this->getThemePath('default') . "/$templateName.html.php";
            if (file_exists("views/$viewPath")) {
                return $viewPath;
            }
        }

        return '';
    }


    protected function addJavascriptFiles($dir, $exclude = array())
    {
        self::addFiles('js', $dir, $this->data['jsFiles'], $exclude);
    }

    protected function addJavascriptNotMinifiedFiles($dir, $exclude = array())
    {
        self::addFiles('js', $dir, $this->data['jsNotMinifiedFiles'], $exclude);
    }

    protected function addCssFiles($dir)
    {
        self::addFiles('css', $dir, $this->data['cssFiles'], array());
    }




    /**
     *
     * @param string $val
     * @return int
     */
    private static function fromValueWithSuffix($val)
    {
        $val = trim($val);
        $result = (int) $val;
        $last = strtolower($val[strlen($val)-1]);
        switch ($last) {
            // The 'G' modifier is available since PHP 5.1.0
            case 'g':
                $result *= 1024;
            case 'm':
                $result *= 1024;
            case 'k':
                $result *= 1024;
        }

        return $result;
    }

    private static function ext($filename)
    {
        return pathinfo($filename, PATHINFO_EXTENSION);
    }

    private static function basename($filename)
    {
        return pathinfo($filename, PATHINFO_BASENAME);
    }

    private static function addFiles($ext, $dir, &$result, $exclude)
    {
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
        }
    }

}
