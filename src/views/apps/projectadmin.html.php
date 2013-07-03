<div class="container" ng-app="projectAdmin">
	<div style="margin-top: 50px"><h2>Project Administration</h2></div>

	<tabset ng-cloak>
	<tab heading="Users">
		<legend>Add User</legend>
		<div ng-controller="UserSearchCtrl">
		<typeahead class="typeahead left span-2" items="user" term="term" search="searchUser(term)" select="selectUser(item)">
			<ul>
				<li typeahead-item="user" ng-repeat="user in users" class="typeahead-item">
					<img width="32px" ng-src="{{imageSource(user.avatarRef)}}" class="left">
					<p class="name">{{user.name}}</p>
					<p class="email">{{user.email}}</p>
				</li>
			</ul>
		</typeahead>
		<button ng-model="addMode" class="btn span-2" ng-click="addUser()"><i ng-class="addModeIcon(addMode)"></i>{{addModeText(addMode)}}</button>
		</div>
		<legend class="">Users</legend>
		<div ng-controller="UserListCtrl">
		<button class="btn" ng-click="removeUsers()"><i class="icon-remove"></i>Remove Users</button>
		<div listview search="queryUsers()" select="">
		<table class="table" style="width: 100%">
			<thead>
			<tr>
				<th></th>
				<th>Username</th>
				<th>Full Name</th>
				<th>Role</th>
				</tr>
			</thead>
			<tbody>
			<tr ng-repeat="user in users"	ng-class="{active: isSelected(user)}" >
				<td width="16px" align="center"><input type="checkbox" ng-checked="isSelected(user)" ng-click="updateSelection($event, user)" /></td>
				<td>{{user.username}}</td>
				<td>{{user.name}}</td>
				<td>&nbsp;</td>
			</tr>
			</tbody>
		</table>		
		</div>
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
	<script	src="/angular-app/common/js/error.js"></script>
	<script	src="/angular-app/common/js/jsonrpc.js"></script>
	<script	src="/angular-app/common/js/listview.js"></script>
	<script	src="/angular-app/common/js/typeahead.js"></script>
	<script	src="/angular-app/common/js/services.js"></script>
	<script	src="/angular-app/projectadmin/js/app.js"></script>
	<script	src="/angular-app/projectadmin/js/controllers.js"></script>
	<script	src="/angular-app/projectadmin/js/directives.js"></script>
	<script	src="/angular-app/projectadmin/js/services.js"></script>
	<script	src="/angular-app/projectadmin/js/filters.js"></script>
</div>