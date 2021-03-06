"use strict";

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

const cpuStats = require('cpu-stats');

var cpu = function(){
	this.load = 0;
	this.getCPU();
}

cpu.prototype.getCPU = function(){
	var self = this;
	cpuStats(1000, function(error, result) {
		var l = 0;
		result.forEach(function(cpu){
			l+=cpu.cpu
		})
		self.load = l/result.length;
		//if(process.env.ELECTRON_ENV === 'development') console.log('LOAD: '+self.load+'%');
		self.getCPU();
	})
}

module.exports = new cpu();
