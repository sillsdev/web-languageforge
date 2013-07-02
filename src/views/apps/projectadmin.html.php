<div class="container" ng-app="projectAdmin">
	<div style="margin-top: 50px"><h2>Project Administration</h2></div>

	<tabset>
	<tab heading="Users">
		<div ng-controller="UserSearchCtrl" style="overflow:hidden">
		<label>User</label>
		<typeahead class="typeahead" items="user" term="term" search="searchUser(term)" select="selectUser(item)">
			<ul>
				<li typeahead-item="user" ng-repeat="user in users" class="typeahead-item">
					<img width="32px" ng-src="{{imageSource(user.avatarRef)}}" class="left">
					<p class="name">{{user.name}}</p>
					<p class="email">{{user.email}}</p>
				</li>
			</ul>
		</typeahead>
		</div>
		<legend>Users (total: {{data.entries.length}})</legend>
		<div ng-controller="UserListCtrl">
		<table class="table" style="width: 100%">
			<thead>
			<tr>
				<th>Username</th>
				<th>Full Name</th>
			</tr>
			</thead>
			<tbody>
			<tr ng-repeat="user in users" ng-class="{info: $index==selectedIndex}" ng-click="selectRow($index, user)">
				<td>{{user.username}}</td>
				<td>{{user.name}}</td>
			</tr>
			</tbody>
		</table>
		<pagination boundary-links="true" num-pages="noOfPages" current-page="currentPage" previous-text="'&lsaquo;'" next-text="'&rsaquo;'" first-text="'&laquo;'" last-text="'&raquo;'"></pagination>
		<div class="left"><a href="#" ng-click="addRecord()" class="btn btn-small"><i class="icon-plus"></i> Add New</a></div>
		<div class="right"><a href="#" ng-click="deleteRecord(vars.record)" class="btn btn-small" ng-class="{disabled: vars.selectedIndex == -1}"><i class="icon-minus"></i> Delete</a></div>
		</div>
		
	</tab>
	<tab heading="Texts">
	</tab>
	</tabset>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
	<script	src="/angular-app/common/js/jsonrpc.js"></script>
	<script	src="/angular-app/common/js/typeahead.js"></script>
	<script	src="/angular-app/common/js/services.js"></script>
	<!-- 	<script	src="/angular-app/projectadmin/js/app.js"></script> -->
	<script	src="/angular-app/projectadmin/js/controllers.js"></script>
	<script	src="/angular-app/projectadmin/js/services.js"></script>
	<script	src="/angular-app/projectadmin/js/filters.js"></script>
	<script	src="/angular-app/projectadmin/js/directives.js"></script>
</div>