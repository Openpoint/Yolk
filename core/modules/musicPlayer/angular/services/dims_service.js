"use strict"

angular.module('yolk').factory('dims',['$timeout',function($timeout) {
	var $scope;
	var dims=function(scope){
		$scope = scope;
		this.menHeight = 30;
		this.searchHeight = 50;
		this.sidebarWidth = 300;
		this.scroller = 15;			
	}
	dims.prototype.update = function(){
		this.playwindowWidth = $(window).width() - this.sidebarWidth;
		this.playwindowHeight = $(window).height() - this.menHeight - this.searchHeight;
		this.sidebarHeight = $(window).height() - this.menHeight;
	}

	$(window).resize(function(){
		$scope.dims.update();
		$timeout(function(){
			$scope.lazy.refresh();
			$('#playwindow').scrollTop($scope.dims.scrollTop);
		});
		
	});
		
	return dims;	
}])