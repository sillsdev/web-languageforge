<?php
require_once(APPPATH . "angular-app/$appName/ng-app.html");
?>
	
<script type="text/javascript">
window.session = <?php echo $jsonSession; ?>
</script>
	
<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
<script	src="/js/lib/angular_stable_1.0.7/angular-sanitize.js"></script>
<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
<script src="/js/lib/ng-ui-utils-validate.js"></script>
<script src="/js/lib/jquery-te-1.4.0.min.js"></script>
<script src="/js/lib/moment-2.1.0-min.js"></script>
<script src="/js/lib/rangy-1.3alpha.772/rangy-core.js"></script>
<script src="/js/lib/rangy-1.3alpha.772/rangy-cssclassapplier.js"></script>
<!-- Not currently used: <script src="/js/lib/rangy-1.3alpha.772/rangy-highlighter.js"></script> -->

<?php foreach($jsCommonFiles as $filename): ?>
<script src="/<?php echo $filename; ?>"></script>
<?php endforeach; ?>

<?php foreach($jsProjectFiles as $filename): ?>
<script src="/<?php echo $filename; ?>"></script>
<?php endforeach; ?>

