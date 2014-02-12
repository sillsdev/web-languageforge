		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<title><?php echo $title; ?></title>
		
		<link rel="stylesheet" href="/css/shared/bootstrap.css" />
		<link rel="stylesheet" href="/css/shared/jquery-te-1.4.0.css" />
		<?php if (isset($cssCommonFiles)): ?>
		<?php foreach($cssCommonFiles as $filename): ?>
		<link rel=stylesheet href="/<?php echo $filename; ?>" />
		<?php endforeach; ?>
		<?php endif; ?>
		<link rel="stylesheet" media="screen" href="/css/shared/superfish.css" />
		<link rel="stylesheet" media="screen" href="/css/shared/slides.css" />
		<link rel="stylesheet" media="screen" href="/css/shared/jquery.fileupload-ui.css" />
		<link rel="stylesheet" href="/css/languageforge/default/lf-dictionary.css" />
		<link rel="stylesheet" href="/css/languageforge/default/lf.css" />
		<link rel="stylesheet" href="/css/languageforge/default/lexiquepro.css" />
		<link rel="icon" href="/images/languageforge/default/favicon.ico" type="image/x-icon" />
		<link href="/css/shared/font-awesome.css" rel="stylesheet">
		<!--
		<link href='http://fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,400,700' rel='stylesheet' type='text/css'>
  -->
		<script src="/js/lib/jquery-1.8.3.min.js"></script>