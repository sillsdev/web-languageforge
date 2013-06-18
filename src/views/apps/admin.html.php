<div ng-app="myApp">
	<div style="margin-top: 150px"><!-- Spacer --></div>
	<div class="container">
		<div class="application" style="padding: 10px" ng-controller="MyCtrl1">
			
		<ul class="menu">
		<li><a href="#/view1">view1</a></li>
		<li><a href="#/view2">view2</a></li>
		</ul>
		<br/>
		Enter message: <input type="text" ng-model="data.message">
		<h3>{{data.message}} world</h3>
		Some JSON-RPC data: {{data}}
			
		</div>
	</div>
	
	<div ng-view></div>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script src="/angular-app/admin/js/app.js"></script>
	<script src="/angular-app/admin/js/services.js"></script>
	<script src="/angular-app/admin/js/controllers.js"></script>
	<script src="/angular-app/admin/js/filters.js"></script>
	<script src="/angular-app/admin/js/directives.js"></script>


	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/jsonrpc.js"></script>
	<script	src="/angular-app/admin/js/controllers.js"></script>
	<!-- <script	src="/angular-app/admin/js/app.js"></script>
	<script	src="/angular-app/admin/js/services.js"></script> -->
	<!-- <script	src="/angular-app/admin/js/filters.js"></script>
	<script	src="/angular-app/admin/js/directives.js"></script> -->
	
	  
</div>