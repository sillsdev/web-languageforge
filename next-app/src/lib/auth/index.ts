// src/Api/Model/Shared/Rights/ProjectRoles.php
// src/Api/Model/Shared/Rights/LexRoles.php
const roles = [
	'project_manager',
	'contributor',
	'tech_support',
	'observer_with_comment',
	'observer',
]

export const can_view_comments = role => roles.filter(_role => _role != 'observer').includes(role)
