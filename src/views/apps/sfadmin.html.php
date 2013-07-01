<div class="container" ng-app="sfAdmin">
	<div style="margin-top: 50px"><h2>SF Administration</h2></div>
	
<ul class="nav nav-tabs">
	<li class="active">
		<a href="#">Users</a>
	</li>
	<li>
		<a href="#">Projects</a>
	</li>
</ul>

		<div class="row" ng-controller="UserCtrl" style="overflow:hidden">
		
			<div class="span8"><user-list/></div>
			
			<div class="span4"><user-data/></div>
		</div>
		
		<div class="row" ng-controller="ProjectCtrl" style="overflow:hidden">
		
			<div class="span8"><project-list/></div>
			
			<div class="span4"><project-data/></div>
		</div>
  
</div>
	
	
	
	
	
	<div ng-view></div>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
	<script	src="/js/jsonrpc.js"></script>
	<script	src="/angular-app/sfadmin/js/app.js"></script>
	<script	src="/angular-app/sfadmin/js/services.js"></script>
	<script	src="/angular-app/sfadmin/js/controllers.js"></script>
	<script	src="/angular-app/sfadmin/js/filters.js"></script>
	<script	src="/angular-app/sfadmin/js/directives.js"></script>
	
	  
</div>