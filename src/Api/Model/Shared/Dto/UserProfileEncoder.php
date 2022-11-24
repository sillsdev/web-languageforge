<?php

namespace Api\Model\Shared\Dto;

use Api\Model\Shared\Mapper\Id;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Mapper\ReferenceList;
use Api\Model\Shared\ProjectModel;
use Palaso\Utilities\CodeGuard;
use Api\Library\Shared\UrlHelper;

class UserProfileEncoder extends JsonEncoder
{
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
        $domain = UrlHelper::getHostname();
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
}
