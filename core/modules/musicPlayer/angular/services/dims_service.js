"use strict"

angular.module('yolk').factory('dims',['$timeout',function($timeout) {
	var $scope;
	var dims=function(scope){
		$scope = scope;
		this.menHeight = 35;
		this.searchHeight = 35;
		this.sidebarWidth = 250;
		this.scroller = 15;
		this.drawerHeight = 0;
	}
	dims.prototype.update = function(){
		this.playwindowWidth = $(window).width() - this.sidebarWidth;
		this.playwindowHeight = $(window).height() - this.menHeight - this.searchHeight;
		this.sidebarHeight = $(window).height() - this.menHeight;
	}

	$(window).resize(function(){
		$timeout(function(){
			$scope.dims.update();
		})		
	});

	return dims;
}])
