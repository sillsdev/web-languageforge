<?php
require_once(APPPATH . "angular-app/$appName/ng-app.html");
?>
	
<script type="text/javascript">
window.session = <?php echo $jsSessionVars; ?>
</script>
	
<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>

<?php foreach($jsCommonFiles as $filename): ?>
    <script	src="/angular-app/common/js/<?php echo $filename; ?>"></script>
<?php endforeach; ?>

<?php foreach($jsProjectFiles as $filename): ?>
<script	src="/angular-app/<?php echo $appName; ?>/js/<?php echo $filename; ?>"></script>
<?php endforeach; ?>
