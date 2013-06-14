<div ng-app="myApp">
	<ul class="menu">
	<li><a href="#/view1">view1</a></li>
	<li><a href="#/view2">view2</a></li>
	</ul>
	
	<div ng-view></div>
	
	<div>Angular seed app: v<span app-version></span></div>
	
	<!-- In production use:
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js"></script>
	-->
	<script src="/lib/angular_stable_1.0.7/angular.js"></script>
	<script src="js/app.js"></script>
	<script src="js/services.js"></script>
	<script src="js/controllers.js"></script>
	<script src="js/filters.js"></script>
	<script src="js/directives.js"></script>
	  
	  
</div>