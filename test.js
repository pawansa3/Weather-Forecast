const EventEmitter = require('events');

class MyStream extends EventEmitter {
  write(data) {this.emit('data', data);}
  Error(){this.emit('error');}
}

const stream = new MyStream();

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
   
});
stream.write('With ES6');

stream.on('error', error => {
	console.log('my error message');
});
stream.Error();