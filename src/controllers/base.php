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
    }

    // all child classes should use this method to render their pages
    protected function renderPage($view, $data=array(), $render=true)
    {
        $this->viewdata = $data;
        $this->viewdata['controller'] = $this;
        $this->viewdata['contentTemplate'] = $this->getContentTemplatePath($view);
        $this->viewdata['themePath'] = $this->getThemePath();

        $this->populateHeaderMenuViewdata();

        $containerTemplatePath = $this->getSharedTemplatePath("container");

        return $this->load->view($containerTemplatePath, $this->viewdata, !$render);
    }

    protected function populateHeaderMenuViewdata()
    {
        $this->viewdata['is_admin'] = false;

        // setup specific variables for header
        $this->viewdata['logged_in'] = $this->_isLoggedIn;

        $featuredProjectList = new FeaturedProjectListModel();
        $featuredProjectList->read();
        $this->viewdata['featuredProjects'] = $featuredProjectList->entries;

        if ($this->_isLoggedIn) {
            $isAdmin = SystemRoles::hasRight($this->_user->role, Domain::USERS + Operation::CREATE);
            $this->viewdata['is_admin'] = $isAdmin;
            $this->viewdata['user_name'] = $this->_user->username;
            $this->viewdata['small_gravatar_url'] = $this->ion_auth->get_gravatar("30");
            $this->viewdata['small_avatar_url'] = $this->_user->avatar_ref;
            $projects = $this->_user->listProjects($this->website->domain);
            $this->viewdata['projects_count'] = $projects->count;
            $this->viewdata['projects'] = $projects->entries;
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
        if (!$theme) {
            $theme = $this->website->theme;
        }

        return $this->website->base . "/" . $theme;
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

    public function template($templateName)
    {
        return $this->getContentTemplatePath($templateName);
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

}
