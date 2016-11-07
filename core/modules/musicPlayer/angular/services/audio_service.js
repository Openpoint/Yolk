angular.module('yolk').factory('audio',['$timeout','$sce',function($timeout,$sce) {
	const path = require('path');

	function onPlayerReady(event) {
		console.log(event);
	}
		
	var $scope;
	
	//create the audio player object
	var audio = function(scope){
		$scope = scope;
		$scope.youtube = window.Yolk.youtube;
		$scope.youtube.onPlayerReady = function(event){
			console.log(event);
		}
		$scope.youtube.onPlayerStateChange = function(event){
			console.log(event);
		}
		var self = this;
		this.video = null;
		this.player = new Audio();
		this.player.addEventListener('ended', function(){
			self.next();
		});
		this.playing = null;
	}
	//Play next track
	audio.prototype.next = function(){
		var index = $scope.lib.tracks.indexOf($scope.lib.playing);

		if((index > -1) && $scope.lib.tracks[index+1]){
			this.play($scope.lib.tracks[index+1]);	
		}else{
			this.play($scope.lib.tracks[0]);
		}
			
	}
	

	//Play a track
	
	audio.prototype.play = function(track){
		var self = this;
		if(track.type === 'local'){
			var source = path.join(track.path,track.file)
		}
		if(track.type === 'jamendo' || track.type === 'internetarchive'){
			var source = track.file;
		}
		if(track.type === 'youtube'){
			var source = track.path+track.file;
			console.log(source);
		}
		if(this.playing !== source){
			if($scope.lib.playing){
				$scope.lib.playing.state = false;
				$scope.lib.playing.ani = false;				
			}
			clearTimeout(Progress);	
					
			$scope.lib.playing = track;
			$scope.lib.devinfo=JSON.stringify(track, null, 4)
			$scope.lib.playing.state = 'playing'
			
			this.playing = source
			if(track.type !== 'youtube'){
				this.player.src = source;			
				this.player.play();	
				$scope.lib.playing.embed = null;			
			}else{
				$scope.lib.playing.embed = $sce.trustAsResourceUrl(track.path+track.file+'?enablejsapi=1&autoplay=1&color=white&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&origin=openpoint.ie');
				this.player.pause();
				if(!self.video){
					
					$timeout(function(){						
						var tag = document.createElement('script');
						tag.id = 'iframe-demo';
						tag.src = 'https://www.youtube.com/iframe_api';
						var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);						
					});					
				}

			}

			$scope.lazy.refresh($('#playwindow').scrollTop());			
			this.progress(true,true);
			$timeout(function(){
				$scope.lib.playing.ani = true;
			},2000);	
		}else{
			if(this.player.paused){
				$scope.lib.playing.state = 'playing';
				this.player.play();
				$scope.lib.playing.ani = true;
				this.progress(true);
			}else{
				$scope.lib.playing.state = 'paused';
				$scope.lib.playing.ani = false;
				clearTimeout(Progress);
				this.player.pause();
			}			
		}			
	}
	
	//seek in the track
	audio.prototype.seek=function(event){
		clearTimeout(Progress);
		$scope.lib.playing.ani = false;
		this.player.currentTime = this.player.duration*(event.offsetX/$(event.target).width());
		this.progress(true);
		$timeout(function(){
			$scope.lib.playing.ani = true;
		},10);
	}
	
	//control the progress bar
	var Progress;
	audio.prototype.progress = function(repeat,reset){ //update the progress bar when playing

		var self = this;
		if(reset){
			$('#playing .progress').css({
				'width':0
			});			
		}
		$('#playing .progress').css({			
			'width':(this.player.currentTime/this.player.duration)*100 +'%'
		});
		

		
		if($scope.lib.playing && $scope.lib.playing.state && repeat){
			Progress = setTimeout(function(){
				self.progress(true);
			},2000);
		}			
	}	
	return audio;
}])