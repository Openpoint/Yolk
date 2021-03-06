'use strict'

/*
Copyright 2017 Michael Jonker (http://openpoint.ie)
This file is part of The Yolk.
The Yolk is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.
The Yolk is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with The Yolk.  If not, see <http://www.gnu.org/licenses/>.
*/

var oldterms = {};
angular.module('yolk').factory('pin',['$timeout',function($timeout) {
	var $scope;
	var pin = function(scope){
		$scope = scope;
		this.pinned = {
			sources:['local','internetarchive','youtube'],
		};
		this.direction = {
			title:'asc',
			artist:'asc',
			album:'asc'
		}
		this.Page = 'title';
		this.sortby = ['metadata.title.raw:'+this.direction[this.Page]];
		this.scroll={
			title:0,
			artist:0,
			album:0
		}
	}
	pin.prototype.resume=function(scope){
		$scope = scope;
		return this;
	}
	pin.prototype.Source = function(data){
		if(data.type === 'Album'){
			$scope.pin.Filter = $scope.tracks.source.filter;
			$scope.searchTerm = '';
			console.error()
			if($scope.pin.Page!=='album'){
				if($scope.playlist.active) $scope.playlist.toggle(true);
				this.page('album',false,$scope.search.all[data.id]);
				//$scope.search.drawer = $scope.search.all[data.id];
			}else{
				$timeout(function(){
					$scope.search.drawer = $scope.search.all[data.id];
					$scope.search.go(false,'source pinned');
				})

			}
		}
		if(data.type==='Playlist'){
			if(!$scope.playlist.active) $scope.playlist.toggle($scope.playlist.selected !== data.id);
			if($scope.playlist.selected !== data.id){
				$scope.playlist.selected = data.id;
				$scope.playlist.change();
			}
		}
	}
	pin.prototype.source = function(name){
		var self = this;
		if(this.pinned.sources.indexOf(name) > -1){
			if(this.pinned.sources.length > 1){
				self.pinned.sources = self.pinned.sources.filter(function(source){
					if(source!==name){
						return true;
					}
				})
				self.pinned.sources.sort()
				$scope.search.go(false,'pin');
			}
		}else{
			self.pinned.sources.push(name);
			self.pinned.sources.sort()
			$scope.search.go(false,'pin');
		}
	}
	pin.prototype.pinner = function(name,type){
		if($scope.playlist.active) return;
		var terms = $scope.tools.terms($scope.searchTerm)
		if(this.pinned[type]) this.pinned[type] = this.pinned[type].toLowerCase();
		if(name) name = name.toLowerCase();
		if(this.pinned[type] === name){
			delete oldterms[type]
			delete terms[type]
		}else{
			terms[type] = name
		}
		var newsearch = ""

		Object.keys(terms).forEach(function(key){
			if(key !== 'prefix') newsearch += key+':'+terms[key]+' '
		})
		newsearch = newsearch.trim();
		$scope.searchNow = true;
		$scope.searchTerm = newsearch

	}
	pin.prototype.prefix = function(name){
		this.pinner(name,'prefix')
	}
	pin.prototype.artist = function(name){
		this.pinner(name,'artist')
	}
	pin.prototype.album = function(name){
		this.pinner(name,'album')
	}
	pin.prototype.title = function(name){
		this.pinner(name,'title');
		if($scope.pin.Page!=='title') $scope.pin.Page = 'title';
	}
	pin.prototype.clear = function(){
		oldterms = {};
		$scope.searchNow = true;
		$scope.searchTerm = '';
		$('#search input').focus();
	}
	pin.prototype.page = function(page,skip,drawer){
		if($scope.playlist.active) skip = true;
		if($scope.playlist.active) $scope.playlist.toggle(true);
		var newterm = '';
		var terms = $scope.tools.terms($scope.searchTerm);

		if(terms.prefix) newterm = terms.prefix;
		if(terms.artist) newterm+=' artist:'+terms.artist;

		if((terms.album||oldterms.album) && page!=='artist') newterm+=' album:'+(terms.album||oldterms.album);
		if(terms.album && page==='artist') oldterms.album = terms.album;

		if((terms.title||oldterms.title) && page!=='album' && page!=='artist') newterm+=' title:'+(terms.title||oldterms.title);
		if(terms.title && (page==='album'||page==='artist')) oldterms.title = terms.title;

		$scope.searchNow = 'skip';
		$scope.searchTerm = newterm.trim()

		if(this.Page === page && !skip){
			this.direction[page] === 'asc' ? this.direction[page] = 'desc':this.direction[page] = 'asc';
		}else if(this.Page !== 'title'){
			$scope.drawers.closeall(this.Page);
		}
		this.Page = page;
		switch (page){
			case 'title':
				this.sortby = this.Filter ? ['date:'+invert(this.direction[page])]:['metadata.title.raw:'+this.direction[page]];
			break;
			case 'artist':
				this.sortby = this.Filter ? ['date:'+invert(this.direction[page])]:['name.raw:'+this.direction[page]];
			break;
			case 'album':
				this.sortby = this.Filter ? ['date:'+invert(this.direction[page])]:['metadata.title.raw:'+this.direction[page]];
			break;
		}
		$timeout(function(){
			if(drawer){
				$scope.search.drawer = drawer;
				$scope.search.noscroll = true;
			}
			$scope.search.go(false,drawer?'source pinned2':'page');
		})

	}
	pin.prototype.filter = function(filter){
		this.Filter === filter ? this.Filter = false:this.Filter = filter;
		this.page(this.Page,true);
	}
	pin.prototype.tracks = function(artist,album,destination){
		delete oldterms.title
		$scope.searchTerm = "artist:"+artist+" album:"+album;
		this.page(destination)
	}
	function invert(dir){
		if(dir==='asc'){
			return 'desc';
		}else{
			return 'asc'
		}
	}
	return pin;
}])
