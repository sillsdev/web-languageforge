<?php

namespace Api\Model\Shared\Dto;

use Api\Library\Shared\Website;
use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Mapper\ReferenceList;
use Api\Model\Shared\ProjectModel;
use Palaso\Utilities\CodeGuard;

class UserProfileEncoder extends JsonEncoder
{
    public function __construct($website)
    {
        $this->_website = $website;
    }

    /** @var Website */
    private $_website;

    /**
     * @param string $key
     * @param ReferenceList $model
     * @return array
     */
    public function encodeReferenceList($key, $model)
    {
        if ($key != "projects") {
            return parent::encodeReferenceList($key, $model);
        }
        $domain = $this->_website->domain;
        $result = array_map(function ($id) use ($domain) {
            CodeGuard::checkTypeAndThrow($id, "Api\Model\Shared\Mapper\Id");
            /** @var Id $id */
            $projectDto = null;
            try {
                $projectModel = new ProjectModel($id->asString());
                // Filter for active projects on the same domain.
                // Also exclude projects that don't have things to modify on User Profile
                // userProfilePropertiesEnabled is type ArrayOf, so testing for empty() didn't work
                if (
                    !$projectModel->isArchived &&
                    $projectModel->siteName == $domain &&
                    count($projectModel->userProperties->userProfilePropertiesEnabled) > 0
                ) {
                    $projectDto = [];
                    $projectDto["id"] = $id->asString();
                    $projectDto["name"] = $projectModel->projectName;
                    $projectDto["userProperties"] = self::encode($projectModel->userProperties);
                }
            } catch (\Exception $e) {
            }

            return $projectDto;
        }, $model->refs);
        // Filter out empty entries in the project list
        return array_values(array_filter($result));
    }

    // Not using encode because we need the additional $website param
    public static function encodeModel($model, $website)
    {
        $e = new UserProfileEncoder($website);

        return $e->_encode($model);
    }
}
