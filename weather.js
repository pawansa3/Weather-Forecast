

//Require https
const EventEmitter = require('events').EventEmitter;
const https = require('https');
const http = require('http');
const util = require('util');

function WeatherReport(query) {

	EventEmitter.call(this);
	weatherEmitter = this;
	const key = process.env.WEATHER_API_KEY;
	try{ //1st error
		const url = 'https://api.apixu.com/v1/forecast.json?key=' + key + '&q=' + query +'&days=7';
		const request = https.get(url, function (response) {
			//console.log('statusCode: ', response.statusCode);
			if(response.statusCode === 200) { //3rd error
				//Read the data
				let body = '';

				response.on('data', function (chunk) {
					body += chunk;
					weatherEmitter.emit('data', chunk);
				});
				//Parse and get the data
				response.on('end', function() {
					try{ //4th error
						let weather = JSON.parse(body);
						weatherEmitter.emit('end', weather);
						//console.log('the temp is ',`${weather.current.temp_f}`);
					} catch(error) {
						//console.error(error.message);
						weatherEmitter.emit('error', error);
					}
				}).on('error', function(error) {
					//console.error(error.message);
					weatherEmitter.emit('error', error);
				});
			} else {
				console.log('error');
				request.abort();
				weatherEmitter.emit('error', new Error("There was an error getting detail for " + query + ". (" + http.STATUS_CODES[response.statusCode] + ")"));
			}
		});//end of https get
		//2nd error
	} catch(error) {
		console.error(error.message);
		weatherEmitter.emit('error', error);
	}
}

util.inherits(WeatherReport, EventEmitter);

module.exports = WeatherReport;
