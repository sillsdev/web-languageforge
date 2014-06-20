<?php
require_once(APPPATH . "$appFolder/ng-app.html");
?>
	
<script type="text/javascript">
window.session = <?php echo $jsonSession; ?>;
</script>
	
<?php if (SF_USE_MINIFIED_JS): ?>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-animate.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-route.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-sanitize.min.js"></script>
	<script src="/js/lib/angular-file-upload.min.js"></script>
	<script src="/js/lib/angular-translate_2.0.1/angular-translate.min.js"></script>
	<script src="/js/lib/angular-translate_2.0.1/angular-translate-loader-static-files.min.js"></script>
	<script src="/js/lib/angularjs-gravatardirective.min.js"></script>
	<script src="/js/lib/truncate.min.js"></script>
	<script src="/js/lib/lodash_2.4.1/lodash.min.js"></script>
	<!-- ng-ui-*.js included in combined scriptureforge-min.js script -->
<?php else: ?>
	<script src="/js/lib/angular_stable_1.2.15/angular.js"></script>
	<script src="/js/lib/angular_stable_1.2.15/angular-animate.js"></script>
	<script src="/js/lib/angular_stable_1.2.15/angular-route.js"></script>
	<script src="/js/lib/angular_stable_1.2.15/angular-sanitize.js"></script>
	<script src="/js/lib/angular-file-upload.js"></script>
	<script src="/js/lib/angular-translate_2.0.1/angular-translate.js"></script>
	<script src="/js/lib/angular-translate_2.0.1/angular-translate-loader-static-files.js"></script>
	<script src="/js/lib/angularjs-gravatardirective.js"></script>
	<script src="/js/lib/truncate.js"></script>
	<script src="/js/lib/lodash_2.4.1/lodash.js"></script>
	<script src="/js/lib/ng-ui-bootstrap-tpls-0.8.0.js"></script>
	<script src="/js/lib/ng-ui-utils-validate.js"></script>
<?php endif; ?>
	

<?php if (SF_USE_MINIFIED_JS): ?>
	<script src="/js/lib/<?php echo $baseSite; ?>.min.js"></script>
<?php else: ?>
	<?php foreach($jsFiles as $filename): ?>
	<script src="/<?php echo $filename; ?>"></script>
	<?php endforeach; ?>
<?php endif; ?>

<?php foreach($jsNotMinifiedFiles as $filename): ?>
<script src="/<?php echo $filename; ?>"></script>
<?php endforeach; ?>


<?php // this is necessary to fix a IE 10 bug where documentReady fires before all JS resources are loaded.
// see: http://stackoverflow.com/questions/12988506/angularjs-fail-to-load-module ?>
<script>angular.bootstrap(document, ['<?php echo $appName;?>']);</script>
