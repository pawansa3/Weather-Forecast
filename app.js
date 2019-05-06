
let WeatherReport = require('./weather.js');
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
require('dotenv').config();

const commonHeader = {'Content-Type': 'text/html'};
//let w = new WeatherReport('london');

const port=process.env.PORT || 8080;

//1. create http server
http.createServer(function(request,response){
	response.writeHead(200, commonHeader);
	homeRoute(request, response);

}).listen(port, function() {
	console.log("server listening at", port);
});

//2. handle get '/' and post '/' url request
function homeRoute(request, response) {
	if(request.url === '/' || request.url === '/?' ){
		if(request.method.toLowerCase() === 'get') {
			response.writeHead(200, commonHeader);
			
			let Weather = new WeatherReport('london');
			Weather.on('end', function(weatherJSON) {
				let def_values = weatherValues(weatherJSON);				
				view('header', {}, response);
				view('body', def_values, response);
				view('footer', {}, response);
				response.end();
			});
		} else {
			//post request
			response.writeHead(200, commonHeader);
			request.on('data', function(postBody){

				let query = querystring.parse(postBody.toString());				
				//response.write(query.q);
				let Weather = new WeatherReport(query.q);
				Weather.on('end', function(weatherJSON) {						
					let str = weatherJSON.current.last_updated;
					let str_day = new Date(str.split(" ")[0]).toLocaleDateString('en-US',{weekday: 'long'});
					let values = weatherValues(weatherJSON);
					view('header', {}, response);
					//response.write(values.loc_name  +' location\n');
					view('body', values, response);
					view('footer', {}, response);
					response.end();
				}); //end of on data
				// on error
				Weather.on('error', function(error) {
					// load error page with def_weather
					view('header', {}, response);
					view('error', {errorMessage: error.message}, response);
					//view('body', weatherValues(weatherJSON), response);
					view('footer', {}, response);
					response.end();
				});
			});// end of request on post data
		}
	}
	else if (request.url.match('\.css$')) {
		var css = fs.createReadStream('./css/style.css',  "UTF-8");
		response.writeHead(200, {'Content-Type': 'text/css' });
		css.pipe(response);
	}
	else if(request.url.match("\.png$")) {
		var path = request.url;
		var png = fs.createReadStream("."+path);
		response.writeHead(200, {"Content-Type": "image/png"});
		png.pipe(response);
	}
	else if(request.url.match("\.ico$")) {
		var icon = fs.createReadStream("./favicon.ico");
		response.writeHead(200, {"Content-Type": "image/x-icon"});
		icon.pipe(response);
	}
	
} 

//3. function that handle the reading of files and merge in file
function view(templateName, values, response){
	let fileContents = fs.readFileSync('./views/' + templateName + '.html', {encoding:'utf8'});
	fileContents = mergeValues(values, fileContents);
	response.write(fileContents);
}
// 4 merging values
function mergeValues(values, content){
	for(let key in values) {
		content = content.replace('{{'+ key +'}}', values[key]);
	}
	return content;
}

//function to return weather values
function weatherValues(weatherJSON) {
	let values = {
					loc_name: weatherJSON.location.name,
					current_temp: weatherJSON.current.temp_c,
					current_icon: weatherJSON.current.condition.icon,
					current_text: weatherJSON.current.condition.text,						
					current_day: dayDate(weatherJSON.location.localtime),
					current_date: weatherJSON.location.localtime,
					current_humidity: weatherJSON.current.humidity,
					current_wind: weatherJSON.current.wind_kph,
					current_wind_dir : weatherJSON.current.wind_dir,

					day2_temp: weatherJSON.forecast.forecastday[1].day.avgtemp_c,
					day2_icon:weatherJSON.forecast.forecastday[1].day.condition.icon ,
					day2_day: dayDate(weatherJSON.forecast.forecastday[1].date),
					day2_text:weatherJSON.forecast.forecastday[1].day.condition.text,
					
					day3_temp: weatherJSON.forecast.forecastday[2].day.avgtemp_c,
					day3_icon:weatherJSON.forecast.forecastday[2].day.condition.icon ,
					day3_day: dayDate(weatherJSON.forecast.forecastday[2].date),					
					day3_text:weatherJSON.forecast.forecastday[2].day.condition.text,

					day4_temp: weatherJSON.forecast.forecastday[3].day.avgtemp_c,
					day4_icon:weatherJSON.forecast.forecastday[3].day.condition.icon ,
					day4_day: dayDate(weatherJSON.forecast.forecastday[3].date),					
					day4_text:weatherJSON.forecast.forecastday[3].day.condition.text,

					day5_temp: weatherJSON.forecast.forecastday[4].day.avgtemp_c,
					day5_icon:weatherJSON.forecast.forecastday[4].day.condition.icon ,
					day5_day: dayDate(weatherJSON.forecast.forecastday[4].date),					
					day5_text:weatherJSON.forecast.forecastday[4].day.condition.text,
					
					day6_temp: weatherJSON.forecast.forecastday[5].day.avgtemp_c,
					day6_icon:weatherJSON.forecast.forecastday[5].day.condition.icon ,
					day6_day: dayDate(weatherJSON.forecast.forecastday[5].date),					
					day6_text:weatherJSON.forecast.forecastday[5].day.condition.text,
					
					day7_temp: weatherJSON.forecast.forecastday[6].day.avgtemp_c,
					day7_icon:weatherJSON.forecast.forecastday[6].day.condition.icon ,
					day7_day: dayDate(weatherJSON.forecast.forecastday[6].date),					
					day7_text:weatherJSON.forecast.forecastday[6].day.condition.text
				};
	return values;
}
//function to return date_day
function dayDate(str) {
	let day = new Date(str.split(" ")[0]).toLocaleDateString('en-US',{weekday: 'long'});
	return day;
}
