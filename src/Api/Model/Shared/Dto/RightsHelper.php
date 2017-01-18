<?php

namespace Api\Model\Shared\Dto;

use Api\Library\Shared\Website;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;

class RightsHelper
{
    /** @var string */
    private $_userId;

    /** @var ProjectModel */
    private $_projectModel;

    /** @var Website */
    private $_website;

    /**
     * @param UserModel $userModel
     * @param ProjectModel $projectModel
     * @return mixed
     */
    public static function encode($userModel, $projectModel) {
        return $projectModel->getRightsArray($userModel->id->asString());
    }

    /**
     * @param string $userId
     * @param int $right
     * @return boolean
     */
    // Note: there is a bug/annoyance in PHP5 whereby you cannot have an object method and a static method named the same
    // I named this static function slightly different from userHasSiteRight to avoid this naming conflict
    // @see http://stackoverflow.com/questions/11331616/php-is-it-possible-to-declare-a-method-static-and-nonstatic
    // @see https://bugs.php.net/bug.php?id=40837
    public static function hasSiteRight($userId, $right) {
        return self::_hasSiteRight($userId, $right);
    }

    /**
     * @param int $right
     * @return bool
     */
    public function userHasSiteRight($right) {
        return self::_hasSiteRight($this->_userId, $right);
    }

    private static function _hasSiteRight($userId, $right) {
        $userModel = new UserModel($userId);
        return (SiteRoles::hasRight($userModel->siteRole, $right) || SystemRoles::hasRight($userModel->role, $right));
    }

    /**
     * @param string $userId
     * @param ProjectModel $projectModel
     * @param Website $website
     */
    public function __construct($userId, $projectModel, $website) {
        $this->_userId = $userId;
        $this->_projectModel = $projectModel;
        $this->_website = $website;
    }

    /**
     * @param int $right
     * @return bool
     */
    public function userHasSystemRight($right) {
        $userModel = new UserModel($this->_userId);

        return SystemRoles::hasRight($userModel->role, $right);
    }


    /**
     * @param int $right
     * @return bool
     */
    public function userHasProjectRight($right) {
        return $this->_projectModel->hasRight($this->_userId, $right);
    }

    /**
     * @param string $methodName
     * @param array $params parameters passed to the method
     * @return bool
     * @throws \Exception
     */
    public function userCanAccessMethod($methodName, $params) {
        switch ($methodName) {

            // User Role (Project Context)
            case 'semdom_editor_dto':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::VIEW);
            case 'semdom_get_open_projects':
                return true;
            case 'semdom_item_update':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::EDIT);
            case 'semdom_project_exists':
                return true;
            case 'semdom_create_project':
                return true;
            case 'semdom_workingset_update':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::EDIT);
            case 'project_getJoinRequests':
                return $this->userHasProjectRight(Domain::USERS + Operation::EDIT);
            case 'project_sendJoinRequest':
                return true;
            case 'semdom_does_googletranslatedata_exist':
                return true;
            case 'project_acceptJoinRequest':
                return $this->userHasProjectRight(Domain::USERS + Operation::EDIT);
            case 'project_denyJoinRequest':
                return $this->userHasProjectRight(Domain::USERS + Operation::EDIT);
            case 'semdom_export_project':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT );

            case 'user_sendInvite':
            case 'message_markRead':
            case 'project_pageDto':
            case 'lex_projectDto':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::VIEW);

            case 'answer_vote_up':
            case 'answer_vote_down':
                return $this->userHasProjectRight(Domain::ANSWERS + Operation::VIEW);

            case 'question_update_answer':
                return $this->userHasProjectRight(Domain::ANSWERS + Operation::EDIT_OWN);

            case 'question_remove_answer':
                return $this->userHasProjectRight(Domain::ANSWERS + Operation::DELETE_OWN);

            case 'question_update_comment':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::EDIT_OWN);

            case 'question_remove_comment':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::DELETE_OWN);

            case 'question_comment_dto':
                return $this->userHasProjectRight(Domain::ANSWERS + Operation::VIEW);

            case 'question_list_dto':
                return $this->userHasProjectRight(Domain::QUESTIONS + Operation::VIEW);

            // Project Manager Role (Project Context)
            case 'user_createSimple':
                return $this->userHasProjectRight(Domain::USERS + Operation::CREATE);

            case 'user_typeahead':
            case 'user_typeaheadExclusive':
                return $this->userHasProjectRight(Domain::USERS + Operation::VIEW);

            case 'message_send':
            case 'project_read':
            case 'project_settings':
            case 'project_settings_by_id':
            case 'project_updateSettings':
            case 'project_readSettings':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            case 'project_update':
            case 'lex_project_update':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            case 'project_updateUserRole':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            case 'project_joinProject':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::EDIT);

            case 'project_usersDto':
                return $this->userHasProjectRight(Domain::USERS + Operation::VIEW);

            case 'project_removeUsers':
                return $this->userHasProjectRight(Domain::USERS + Operation::DELETE);

            case 'text_update':
            case 'text_read':
            case 'text_settings_dto':
            case 'text_exportComments':
                return $this->userHasProjectRight(Domain::TEXTS + Operation::EDIT);

            case 'text_archive':
            case 'text_publish':
                return $this->userHasProjectRight(Domain::TEXTS + Operation::ARCHIVE);

            case 'sfChecks_uploadFile':
                return $this->userHasProjectRight(Domain::TEXTS + Operation::EDIT);

            case 'question_update':
            case 'question_read':
                return $this->userHasProjectRight(Domain::QUESTIONS + Operation::EDIT);

            case 'question_update_answerExportFlag':
                return $this->userHasProjectRight(Domain::TEXTS + Operation::EDIT);

            case 'question_update_answerTags':
                return $this->userHasProjectRight(Domain::TAGS + Operation::EDIT);

            case 'question_archive':
            case 'question_publish':
                return $this->userHasProjectRight(Domain::QUESTIONS + Operation::ARCHIVE);

            // Admin (system context)
            case 'user_read':
            case 'user_list':
                return $this->userHasSiteRight(Domain::USERS + Operation::VIEW);

            case 'user_update':
            case 'user_create':
                return $this->userHasSiteRight(Domain::USERS + Operation::EDIT);

            case 'user_delete':
                return $this->userHasSiteRight(Domain::USERS + Operation::DELETE);

            case 'project_archive':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::ARCHIVE) ||
                        $this->userHasSiteRight(Domain::PROJECTS + Operation::CREATE);

            case 'project_archivedList':
            case 'project_publish':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::ARCHIVE);

            case 'project_list':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::VIEW);

            case 'project_create':
            case 'project_create_switchSession':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::CREATE);

            case 'project_join_switchSession':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::CREATE);

            case 'project_delete':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::DELETE) ||
                        $this->userHasSiteRight(Domain::PROJECTS + Operation::CREATE);

            case 'projectcode_exists':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::CREATE);

            case 'questionTemplate_update':
                return $this->userHasProjectRight(Domain::TEMPLATES + Operation::EDIT);

            case 'questionTemplate_read':
                return $this->userHasProjectRight(Domain::TEMPLATES + Operation::VIEW);

            case 'questionTemplate_delete':
                return $this->userHasProjectRight(Domain::TEMPLATES + Operation::DELETE);

            case 'questionTemplate_list':
                return $this->userHasProjectRight(Domain::TEMPLATES + Operation::VIEW);

            // User (site context)
            case 'user_readProfile':
                return $this->userHasSiteRight(Domain::USERS + Operation::VIEW_OWN);

            case 'user_updateProfile':
            case 'check_unique_identity':
            case 'change_password': // change_password requires additional protection in the method itself

                return $this->userHasSiteRight(Domain::USERS + Operation::EDIT_OWN);
            case 'project_list_dto':
            case 'activity_list_dto':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::VIEW_OWN);

            case 'session_getSessionData':
                return true;



            // LanguageForge (lexicon)
            case 'lex_configuration_update':
            case 'lex_configuration_read':
            case 'lex_upload_importLift':
            case 'lex_upload_importProjectZip':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            case 'lex_baseViewDto':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::VIEW);

            case 'lex_dbeDtoFull':
            case 'lex_dbeDtoFull_by_id':
            case 'lex_dbeDtoUpdatesOnly':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::VIEW);

            // case 'lex_entry_read':
            case 'lex_entry_update':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::EDIT);

            case 'lex_entry_remove':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::DELETE);

            case 'lex_comment_update':
            case 'lex_commentReply_update':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::EDIT_OWN);

            case 'lex_comment_delete':
            case 'lex_commentReply_delete':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::DELETE_OWN);

            case 'lex_comment_updateStatus':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::EDIT);

            case 'lex_comment_plusOne':
                return $this->userHasProjectRight(Domain::COMMENTS + Operation::VIEW);

            case 'lex_optionlist_update':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            case 'lex_uploadAudioFile':
            case 'lex_uploadImageFile':
            case 'lex_project_removeMediaFile':
                return $this->userHasProjectRight(Domain::ENTRIES + Operation::EDIT);

            // send receive api
            case 'sendReceive_getProjectStatus':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::VIEW);

            case 'sendReceive_updateSRProject':
            case 'sendReceive_receiveProject':
            case 'sendReceive_commitProject':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            // project management app
            case 'project_management_dto':
            case 'project_management_report_sfchecks_userEngagementReport':
            case 'project_management_report_sfchecks_topContributorsWithTextReport':
            case 'project_management_report_sfchecks_responsesOverTimeReport':
                return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

            // semdomtrans app management
            case 'semdomtrans_app_management_dto':
            case 'semdomtrans_export_all_projects':
                return $this->userHasSiteRight(Domain::PROJECTS + Operation::EDIT);

            // xforge frame
            case 'xforge_frame_can_show_page_help_button':
                return true;
            
            default:
                throw new \Exception("API method '$methodName' has no security policy defined in RightsHelper::userCanAccessMethod()");
        }
    }
}
