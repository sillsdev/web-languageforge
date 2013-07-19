<?php
require_once(APPPATH . "angular-app/$appName/ng-app.html");
?>
	
<script type="text/javascript">
window.session = <?php echo $jsSessionVars; ?>
</script>
	
<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
<script src="/js/lib/ng-ui-utils-validate.js"></script>
<script src="/js/lib/jquery-te-1.4.0.min.js"></script>

<?php foreach($jsCommonFiles as $filename): ?>
<script src="/<?php echo $filename; ?>"></script>
<?php endforeach; ?>

<?php foreach($jsProjectFiles as $filename): ?>
<script src="/<?php echo $filename; ?>"></script>
<?php endforeach; ?>

