<?php

namespace libraries\shared\scripts\control;

class Panel {

	public function run() {
		$message = "<h2>Scripts Control Panel</h2>";
		$message .= "<h3>Migration Scripts</h3>";
		$message .= "<ul>";
		$message .= "<li><a href='/script/migration/FixAnswerCommentUserRefs'>FixAnswerCommentUserRefs</a></li>";
		$message .= "<li><a href='/script/migration/FixProjectUserRefs'>FixProjectUserRefs</a></li>";
		$message .= "<li><a href='/script/migration/FixUserRoles'>FixUserRoles</a></li>";
		$message .= "</ul>";
		return $message;
	}
}

?>
