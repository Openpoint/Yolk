'use strict'

angular.module('yolk').factory('lazy',[function() {

	/*
	 * construct the lazy loader and scrolling for track listings to improve rendering performance of ng-repeat
	 *
	 * */

	var $scope;
	var lazy = function(scope){
		$scope = scope;
		this.Top = 0;
		this.trackHeight = 130;
		this.progressHeight = 10;
		this.playingHeight = this.trackHeight+this.progressHeight;
		this.chunk = 0;
		watchScroll();
	}
	//set the padding in the playwindow
	lazy.prototype.fixChrome = function(drawers){
		$scope.tracks.drawerPos(true,drawers);
		if($scope.lazy.chunk > 1){
			var padding = ($scope.lazy.Top-$scope.lazy.Step)*$scope.lazy.trackHeight;
		}else{
			var padding = 0;
		}
		var height = $scope.lib.size*$scope.lazy.trackHeight+($scope.dpos.spacer||$scope.dpos.height||0);
		$scope.dims.dyn = {
			paddingTop:padding,
			height:height-padding
		}
		//$('#tracks').css({paddingTop:padding});
		//$('#tracks').height(height-padding);
		/*
		$scope.lib.drawers.noscroll = true;
		setTimeout(function(){
			$scope.tracks.drawerPos();
			$scope.lib.drawers.noscroll = false;
		})

		setTimeout(function(){
			//$scope.tracks.drawerPos();
			$('#tracks').css({paddingTop:padding+$scope.lib.drawers.padding});
			$('#tracks').height(height-padding);
			console.log('height:'+$scope.lib.drawers.height+' padding:'+$scope.lib.drawers.padding)
		})
		*/

	}

	lazy.prototype.refresh = function(sTop){
		if(sTop){
			var top = sTop;
		}else{
			var top = 0;
			this.chunk = 0;
			$('#playwindow').scrollTop(top);
		}
		this.step(top);
		//this.getPos();
	}

	lazy.prototype.scroll = function(scrolltop){
		if($scope.dpos.isvis){
			scrolltop-=$scope.dpos.spacer||$scope.dpos.height;
			var newchunk = Math.floor(scrolltop/this.chunkHeight);
			if(newchunk > this.chunk||$scope.dpos.vis==='above') this.chunk = newchunk;
		}else{
			this.chunk = Math.floor(scrolltop/this.chunkHeight);
		}
		this.Top = this.Step*this.chunk;
		this.Bottom = this.Top+this.Step*2;
	}

	lazy.prototype.step = function(){
		this.winHeight = $scope.dims.playwindowHeight;
		this.Step = Math.ceil(this.winHeight/this.trackHeight);
		this.chunkHeight = this.Step*this.trackHeight;
		this.scroll($('#playwindow').scrollTop());
	}

	// get the relative position of the currently playing track in the track window
	lazy.prototype.getPos = function(i){
		var self = this;
		$scope.lib.playing.filter.pos = i;
		self.spacer=true;
		if(i > -1){
			$scope.lib.playing.top = i*$scope.lazy.trackHeight;
			$scope.lib.playing.bottom = $scope.lib.playing.top + $scope.lazy.trackHeight;
			self.playPos($('#playwindow').scrollTop(),true);
		}else{
			playPos.bottom();
		}
	}

	// decide if the currently playing track should stick to top or bottom of screen
	var playPos = {
		clear:function(){
			//console.log('clear')
			$scope.lib.playing.Top = false;
			$scope.lib.playing.Bottom = false;
			$scope.lib.playing.Pinned = false;
			$('#playing .inner').css({
				position:'static',
				top:'auto',
				bottom:'auto'
			}).removeClass('Top Bottom');
		},
		top:function(){
			//console.log('top')
			$('#playing .inner').css({
				position:'fixed',
				top:$scope.dims.menHeight+$scope.dims.searchHeight,
				bottom:'auto'
			}).addClass('Top').removeClass('Bottom');
			$scope.lib.playing.Bottom = false;
			$scope.lib.playing.Top = true;
			$scope.lib.playing.Pinned = true;
		},
		bottom:function(){
			//console.log('bottom')
			$('#playing .inner').css({
				position:'fixed',
				top:'auto',
				bottom:0
			}).addClass('Bottom').removeClass('Top');
			$scope.lib.playing.Top = false;
			$scope.lib.playing.Bottom = true;
			$scope.lib.playing.Pinned = true;
		}
	}

	lazy.prototype.playPos = function(stop,fix){
		if(!$scope.lib.playing) return;
		if($scope.pin.Page!=='title'||($scope.pin.Page==='title' && $scope.lib.playing.filter.pos === -1)){
			playPos.bottom();
			return;
		}
		if(!stop) stop = $('#playwindow').scrollTop();
		if($scope.lib.playing.filter.pos > -1){
			if(fix){
				playPos.clear();
			}
			if(stop - $scope.lib.playing.top > 0){
				if(!$scope.lib.playing.Top){
					playPos.top();
				}
			}else if(stop + $scope.lazy.winHeight - $scope.lib.playing.bottom <= 0){
				if(!$scope.lib.playing.Bottom){
					playPos.bottom();
				}
			}else if($scope.lib.playing.Top || $scope.lib.playing.Bottom){
				playPos.clear();
			}
		}
	}

	//focus-scroll to the playing track
	lazy.prototype.Scroll=function(dir){

		if (dir === 'down'){
			var scroll = $scope.lib.playing.top - $scope.lazy.trackHeight
		}else if (dir ==='up'){
			var scroll = $scope.lib.playing.bottom - $scope.dims.playwindowHeight + $scope.lazy.trackHeight
		}
		$('#playwindow').animate({scrollTop:scroll},1000,'swing');
	}

	var watchScroll = function(){
		// watch for scrolling of the track list
		var scrollfix;
		var t=0;
		$('#playwindow').scroll(function(e){
			//if($scope.lib.drawers.noscroll) return;
			clearTimeout(scrollfix); // in a long list scrolling by the handle goes too fast for the scroll event - do a automatic cleanup
			var scrollTop = $scope.dims.scrollTop = $('#playwindow').scrollTop();
			$scope.lazy.playPos(scrollTop);
			scrollfix = setTimeout(function(){
				$scope.tracks.drawerPos();
				$scope.lazy.scroll(scrollTop);
				$scope.search.go(false,'scroll');
				$scope.scrolling =false;
			},100);


		});
	}
	return lazy;
}])
