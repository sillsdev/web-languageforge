<div class="container" ng-app="userProfile">
	<div ng-show="error"><h1>Error: {{error.message}}</h1></div>
	<div ng-controller="userProfileCtrl" ng-show="user.id">
		<form>
			<fieldset>
				<legend>{{user.name}}'s User Profile</legend>
				<label>Username</label>
				<input type="text" placeholder="(username)" ng-model="user.username"/>
				<label>Full Name</label>
				<input type="text" placeholder="(full name)" ng-model="user.name"/>
				<label>Email Address</label>
				<input type="text" placeholder="(email)" ng-model="user.email"/>
				<label class="checkbox"><input type="checkbox" ng-model="user.active" /> Is Active</label>
				<label><a href="#">Change Password</a></label>
				<button style="margin-top:20px" type="submit" class="btn">Save</button>
				<div class="well">
					<label>Last Login:  {{user.last_login * 1000 | date:shortDate}}</label>
				</div>
			</fieldset>
		</form>
	</div>
</div>
	
	
	
	
	
	
<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
<script	src="/js/lib/ng-ui-bootstrap-tpls-0.4.0.js"></script>
<script	src="/js/jsonrpc.js"></script>
<script	src="/angular-app/userprofile/js/app.js"></script>