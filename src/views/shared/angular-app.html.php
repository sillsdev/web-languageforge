<?php
require_once APPPATH . "$appFolder/ng-app.html";
?>

<script type="text/javascript">
window.session = <?php echo $jsonSession; ?>;
</script>

<?php if (SF_USE_MINIFIED_JS): ?>
    <!-- Angular File Upload only has v1.6.1, v2.2.2, v3.0+ on CDN. Since we use v1.6.7, keep it in the repo. IJH 2015-02 -->
    <script src="/vendor_bower/angularjs-file-upload/angular-file-upload-html5-shim.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-animate.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-route.min.js"></script>
    <!-- Text Angular has its own version of sanitize, see https://github.com/fraywing/textAngular#where-to-get-it
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.15/angular-sanitize.min.js"></script> -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.10/angular-ui-router.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular-sanitize.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular.min.js"></script>
    <script src="/vendor_bower/angularjs-file-upload/angular-file-upload.min.js"></script>
    <script src="/js/lib/angular-translate_2.2.0/angular-translate.min.js"></script>
    <script src="/js/lib/angular-translate_2.2.0/angular-translate-loader-static-files.min.js"></script>
    <script src="/js/lib/angularjs-gravatardirective.min.js"></script>
    <script src="/js/lib/truncate.min.js"></script>
    <script src="/js/lib/lodash_2.4.1/lodash.min.js"></script>
    <!-- ng-ui-*.js included in combined scriptureforge-min.js script -->
<?php else: ?>
    <script src="/vendor_bower/angularjs-file-upload/angular-file-upload-html5-shim.js"></script>
    <script src="/js/lib/angular_stable_1.2.15/angular.js"></script>
    <script src="/js/lib/angular_stable_1.2.15/angular-animate.js"></script>
    <script src="/js/lib/angular_stable_1.2.15/angular-route.js"></script>
    <!-- Text Angular has its own version of sanitize, see https://github.com/fraywing/textAngular#where-to-get-it
    <script src="/js/lib/angular_stable_1.2.15/angular-sanitize.js"></script> -->
    <script src="/js/lib/angular-ui-router_0.2.10/angular-ui-router.js"></script>
    <script src="/vendor_bower/textAngular/src/textAngular-sanitize.js"></script>
    <script src="/vendor_bower/textAngular/src/textAngularSetup.js"></script>
    <script src="/vendor_bower/textAngular/src/textAngular.js"></script>
    <script src="/vendor_bower/angularjs-file-upload/angular-file-upload.js"></script>
    <script src="/js/lib/angular-translate_2.2.0/angular-translate.js"></script>
    <script src="/js/lib/angular-translate_2.2.0/angular-translate-loader-static-files.js"></script>
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
