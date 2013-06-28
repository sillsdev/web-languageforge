<div class="row" ng-app="sfAdmin">
	<div style="margin-top: 50px"><h2>Project Administration</h2></div>
	
<div class="section-container auto" data-section>
  <section>
    <p class="title" data-section-title><a href="#">Users</a></p>
    <div class="content" data-section-content>
    
		<div class="row" ng-controller="UserCtrl" style="overflow:hidden">
		
			<div class="large-8 column"><user-list/></div>
			
			<div class="large-4 column"><user-data/></div>
		</div>
		
    </div>
  </section>
  
  <section>
    <p class="title" data-section-title><a href="#">Texts</a></p>
    <div class="content" data-section-content>
		<div class="row" ng-controller="TextCtrl" style="overflow:hidden">
		
			<div class="large-8 column"><project-list/></div>
			
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
  
  </div>
	
	
	
	
	
	<div ng-view></div>
	
	<!-- Not yet implemented: <div>Angular seed app: v<span app-version></span></div> -->
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script	src="/js/lib/angular_stable_1.0.7/angular.js"></script>
	<script	src="/js/jsonrpc.js"></script>
	<script	src="/angular-app/sfadmin/js/app.js"></script>
	<script	src="/angular-app/sfadmin/js/services.js"></script>
	<script	src="/angular-app/sfadmin/js/controllers.js"></script>
	<script	src="/angular-app/sfadmin/js/filters.js"></script>
	<script	src="/angular-app/sfadmin/js/directives.js"></script>
	
	  
</div>