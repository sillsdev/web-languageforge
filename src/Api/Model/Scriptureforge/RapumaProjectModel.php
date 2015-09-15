<?php

namespace Api\Model\Scriptureforge;

class RapumaProjectModel extends SfProjectModel
{
    public function __construct($id = '')
    {
        $this->rolesClass = 'Api\Model\Scriptureforge\Rapuma\RapumaRoles';
        $this->appName = SfProjectModel::RAPUMA_APP;

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }
}
