<?php

namespace libraries\shared\scripts\control;

class Panel {

	public function run() {
		$message = '<div ng-app>';
		$message .= '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.min.js"></script>';
		$message .= '<h2>Scripts Control Panel {{}}</h2>';
		$message .= '<h3>Migration Scripts</h3>';
		$message .= '<select ng-model="run"><option value="">Test only</option><option value="/run">Run</option></select>';
		$message .= '<ul>';
		$message .= '<li><a href="/script/migration/FixAnswerCommentUserRefs{{run}}">FixAnswerCommentUserRefs </a></li>';
		$message .= '<li><a href="/script/migration/FixProjectUserRefs{{run}}">FixProjectUserRefs </a></li>';
		$message .= '<li><a href="/script/migration/FixUserRoles{{run}}">FixUserRoles </a></li>';
		$message .= '<li><a href="/script/migration/FixAvatarRefs{{run}}">FixAvatarRefs </a></li>';
		$message .= '<li><a href="/script/migration/MakeAllSfchecksProjects">MakeAllSfchecksProjects </a></li>';
		$message .= '</ul>';
		$message .= '</div>';
		return $message;
	}
}

?>
