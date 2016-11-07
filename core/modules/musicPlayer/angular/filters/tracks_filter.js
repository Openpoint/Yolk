'use strict'

angular.module('yolk').filter('tracks',[function() {
	
	var $scope;
	return function(scope){
		$scope = scope;
		var tracks = $scope.allTracks;
		var lazy = $scope.lazy;
		var pinned = $scope.pinned;
		var isPinned;
	
		var search = $scope.search;
		
		
		function filter(type,value){		
			tracks = tracks.filter(function(track){
				
				if(track.metadata[type] === value){
					return true;
				}
			});
			return tracks;
		}

		if(pinned.album){
			isPinned = true;
			tracks = filter('album',pinned.album);
		}
		if(pinned.artist){
			isPinned = true;
			tracks = filter('artist',pinned.artist);
		}

		lazy.libSize = tracks.length;
		
		if(!lazy.libSize && isPinned){
			tracks = $scope.allTracks;
			lazy.libSize = tracks.length;
		}
		
		if(!lazy.Step){
			lazy.step();
		}else{
			lazy.scroll();
		}		
				
		var newTracks = [];
		var zebra = 'odd';
		if($scope.lib.playing){
			$scope.lib.playing.filter.pos=-1;
		}
		for(var i = 0; i < tracks.length; i++){
			if($scope.lib.playing && (tracks[i].id === $scope.lib.playing.id)){
				$scope.lib.playing.filter.pos = i;
				$scope.lazy.getPos();
			};			
			if(i < lazy.Bottom && i >= lazy.Top){				
				tracks[i].filter.zebra = zebra;
				tracks[i].filter.pos = i;							
				newTracks.push(tracks[i]);
			}
			if(zebra === 'odd'){
				zebra === 'even';
			}else{
				zebra === 'odd';
			}
		}
		
		return newTracks;		
	}
}])