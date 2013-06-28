<div class="row" ng-app="myApp">
	<div style="margin-top: 50px"><h2>SF Administration</h2></div>
	
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
    <p class="title" data-section-title><a href="#">Projects</a></p>
    <div class="content" data-section-content>
      <p>Project Administration</p>
    </div>
  </section>
  
  <section>
    <p class="title" data-section-title><a href="#">Texts</a></p>
    <div class="content" data-section-content>
      <p>Texts Administration</p>
    </div>
  </section>
  
  <section>
    <p class="title" data-section-title><a href="#">Questions</a></p>
    <div class="content" data-section-content>
      <p>Questions Administration</p>
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
	<script	src="/angular-app/admin/js/app.js"></script>
	<script	src="/angular-app/admin/js/services.js"></script>
	<script	src="/angular-app/admin/js/controllers.js"></script>
	<script	src="/angular-app/admin/js/filters.js"></script>
	<script	src="/angular-app/admin/js/directives.js"></script>
	
	  
</div>