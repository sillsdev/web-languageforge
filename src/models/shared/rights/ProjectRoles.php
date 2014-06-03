<?php
namespace models\shared\rights;

use models\shared\rights\RolesBase;

class ProjectRoles extends RolesBase {
	const MANAGER = 'project_manager';
	const MEMBER = 'member';
	const NONE = 'none';
}

?>