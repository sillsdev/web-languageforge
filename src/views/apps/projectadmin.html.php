<div class="row" ng-app="projectAdmin">
	<div style="margin-top: 50px"><h2>Project Administration</h2></div>
	
<div class="section-container auto" data-section>
<section>
    <p class="title" data-section-title><a href="#">Users</a></p>
    <div class="content" data-section-content>
	<div class="row" ng-controller="UserSearchCtrl" style="overflow:hidden">
	Stuff in here
	<typeahead class="typeahead" items="user" term="term" search="searchUser(term)" select="selectUser(item)">
		<ul>
			<li typeahead-item="user" ng-repeat="user in users" class="results">
				<img ng-src="{{imageSource(user)}}">
				<p class="name">{{user.name}}</p>
				<p class="email">{{user.email}}</p>
			</li>
		</ul>
	</typeahead>
	</div>
	</div>
</section>
<section>
    <p class="title" data-section-title><a href="#">UsersOrg</a></p>
    <div class="content" data-section-content>
	<div class="row" ng-controller="UserCtrl" style="overflow:hidden">
	<div class="large-8 column">
		<fieldset>
		<style type="text/css">
			tr.active {background-color: #5da423 !important;}
		</style>
		<legend>Users (total: {{data.result.entries.length}})</legend>
		<table style="width: 100%">
			<tr>
				<th>User Name <span class="right"><i class="icon-sort-by-alphabet"></i>&nbsp;<i class="icon-sort-by-alphabet-alt"></i></span></th>
				<th>Full Name <span class="right"><i class="icon-sort-by-alphabet"></i>&nbsp;<i class="icon-sort-by-alphabet-alt"></i></span></th>
			</tr>
			<tr ng-repeat="user in data.result.entries" ng-class="{active: $index==vars.selectedIndex}" ng-click="selectRow($index, user)">
				<td>{{user.username}}</td>
				<td>{{user.name}}</td>
			</tr>
		</table>
		<div class="left"><a href="#" ng-click="addRecord()" class="small button"><i class="icon-plus"></i></a></div>
		<div class="right"><a href="#" ng-click="deleteRecord(vars.record)" class="small button" ng-class="{disabled: vars.selectedIndex == -1}"><i class="icon-minus"></i></a></div>
		</fieldset>
	</div>
	<div class="large-4 column">
		<form ng-submit="updateRecord(record)" ng-hide="(vars.editButtonName=='')">
		<fieldset>
			<legend>User data</legend>
			<div class="row">
				<div class="large-12">
					<label>User Name</label>
					<input type="text" placeholder="(username)" ng-model="record.username" ng-focus="vars.inputfocus"/>
				</div>
				<div class="large-12">
					<label>Name</label>
					<input type="text" placeholder="(your name here)" ng-model="record.name" ng-focus="vars.inputfocus"/>
				</div>
				<div class="large-12">
					<label>Email</label>
					<input type="text" placeholder="(no email)" ng-model="record.email"/>
				</div>
				<div class="large-12">
					<label>Password</label>
					<input type="text" placeholder="(enter new password)" ng-model="record.password"/>
				</div>
				<div class="large-12">
					<label>Confirm Password</label>
					<input type="text" placeholder="(confirm password)" ng-model="record.password_confirm"/>
				</div>
			</div>
			<ul class="button-group">
				<li>
					<a href="#" class="small button round" ng-click="updateRecord(record)">
						<i class="icon-{{vars.editButtonIcon}}"></i> {{vars.editButtonName}}
					</a>
				</li>
			</ul>
		</fieldset>
		<input type="submit" style="position: absolute; left: -9999px; width: 1px; height: 1px;"/>
		</form>
	</div>
	</div>
	</div>
</section>
<!-- 
<section>
    <p class="title" data-section-title><a href="#">Texts</a></p>
    <div class="content" data-section-content>
		<div class="row" ng-controller="TextCtrl" style="overflow:hidden">
		
			<div class="large-8 column"></div>
			
			<div class="large-4 column"><project-data/></div>
		</div>
    </div>
  </section>
  
  <section>
    <p class="title" data-section-title><a href="#">Questions</a></p>
    <div class="content" data-section-content>
		<div class="row" ng-controller="QuestionCtrl" style="overflow:hidden">
		
			<div class="large-8 column"><project-list/></div>
			
			<div class="large-4 column"><project-data/></div>
		</div>
    </div>
  </section>
 --> 
	</div>
	<div ng-view></div>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/angular-app/common/js/jsonrpc.js"></script>
<!-- 	<script	src="/angular-app/projectadmin/js/app.js"></script> -->
	<script	src="/angular-app/projectadmin/js/controllers.js"></script>
	<script	src="/angular-app/projectadmin/js/services.js"></script>
	<script	src="/angular-app/projectadmin/js/filters.js"></script>
	<script	src="/angular-app/projectadmin/js/directives.js"></script>
	
	  
</div>