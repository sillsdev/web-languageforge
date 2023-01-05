// src/Api/Model/Shared/Rights/ProjectRoles.php
// src/Api/Model/Shared/Rights/LexRoles.php
const roles = [
	'project_manager',
	'contributor',
	'tech_support',
	'observer_with_comment',
	'observer',
]

export const can_view_comments = (role: string) => roles.filter(_role => _role != 'observer').includes(role)
export const can_view_activity = (role: string) => roles.filter(_role => ! _role.startsWith('observer')).includes(role)
