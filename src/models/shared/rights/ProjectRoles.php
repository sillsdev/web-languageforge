<?php
namespace models\shared\rights;

use models\shared\rights\RolesBase;

class ProjectRoles extends RolesBase {
	const MANAGER = 'project_manager';
	const CONTRIBUTOR = 'member';
	const NONE = 'none';
}

?>