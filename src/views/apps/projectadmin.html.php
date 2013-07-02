<div class="container" ng-app="projectAdmin">
	<div style="margin-top: 50px"><h2>Project Administration</h2></div>

	<tabset>
	<tab heading="Users">
		<div ng-controller="UserSearchCtrl" style="overflow:hidden">
		<label>User</label>
		<typeahead2 class="typeahead" items="user" term="term" search="searchUser(term)" select="selectUser(item)">
			<ul>
				<li typeahead-item="user" ng-repeat="user in users" class="results">
					<img ng-src="{{imageSource(user)}}">
					<p class="name">{{user.name}}</p>
					<p class="email">{{user.email}}</p>
				</li>
			</ul>
		</typeahead2>
		</div>
	</tab>
	</tabset>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
	<script	src="/angular-app/common/js/jsonrpc.js"></script>
<!-- 	<script	src="/angular-app/projectadmin/js/app.js"></script> -->
	<script	src="/angular-app/projectadmin/js/controllers.js"></script>
	<script	src="/angular-app/projectadmin/js/services.js"></script>
	<script	src="/angular-app/projectadmin/js/filters.js"></script>
	<script	src="/angular-app/projectadmin/js/directives.js"></script>
</div>