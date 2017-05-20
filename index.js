window.$ = window.jQuery = require('jquery');
const Yolk = {};

$(window).ready(function(){

	Yolk.modules = Yolk.remote('clientReady')();
	require('angular');
	require('angular-route');
	require('angular-animate');
	require('./core/routing.js');
	require('angular-drag-drop');

	for(var key in Yolk.modules){
		var module = Yolk.modules[key];

		//load the controllers
		if(module.controller){
			require(module.controller)
		}

		//load the support files
		['services','filters','directives'].forEach(function(type){
			if(module[type] && module[type].length){
				module[type].forEach(function(service){
					try{
						require(service)
					}
					catch(error){
						console.error(service+'\n', error)
					}

				})
			}
		})
	}
	setTimeout(function(){
		ipcRenderer.send('domReady');
	})
})
const {ipcRenderer} = require('electron');
const path = require('path');


Yolk.remote = require('electron').remote.process.Yolk.remote;
Yolk.home = Yolk.remote('home');
Yolk.root = Yolk.remote('root');

Yolk.remote('dbReady').then(function(data){
	Yolk.db = require(path.join(Yolk.root,'core/lib/elasticsearch.js'));
})
Yolk.fixChrome = function(){
	$('#chrome').clone().appendTo('#topmen').attr('height','100%');
}
Yolk.getModule=function(){
	var head  = document.getElementsByTagName('head')[0];
	$('head [id^=inject]').remove();
	var modname = window.location.hash.split('/')[1];
	if(!modname){
		modname = 'boot'
	}
	var module = Yolk.modules[modname];

  if(module.css && module.css.length){
	  var count = 0;
	  module.css.forEach(function(css){
		  var link  = document.createElement('link');
		  link.rel  = 'stylesheet';
		  link.type = 'text/css';
		  link.media = 'all';
		  link.href = css;
		  link.id='inject'+count;
		  count++;
		  head.appendChild(link);
	  })
  }
  Yolk.remote('coreprocess')(modname);
}