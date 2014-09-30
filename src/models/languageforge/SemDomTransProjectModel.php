<?php

namespace models\languageforge;


class SemDomTransProjectModel extends LfProjectModel {
    public function __construct($id = '')
    {
        $this->rolesClass = 'models\languageforge\semdomtrans\SemDomTransRoles';
        $this->appName = LfProjectModel::SEMDOMTRANS_APP;

        // This must be last, the constructor reads data in from the database which must overwrite the defaults above.
        parent::__construct($id);
    }

} 