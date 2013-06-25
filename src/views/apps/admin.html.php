<div ng-app="myApp">
	<div style="margin-top: 150px"><!-- Spacer --></div>
	<div class="container" ng-controller="UserCtrl" style="overflow:hidden">
		<div style="padding:10px">

		<div class="large-8 column"><user-list/></div>
		
		<div class="large-4 column"><user-data/></div>
	</div>
	
	<div ng-view></div>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/jsonrpc.js"></script>
	<script	src="/angular-app/admin/js/app.js"></script>
	<script	src="/angular-app/admin/js/services.js"></script>
	<script	src="/angular-app/admin/js/controllers.js"></script>
	<script	src="/angular-app/admin/js/filters.js"></script>
	<script	src="/angular-app/admin/js/directives.js"></script>
	
	  
</div>