## Install
```
$ npm install --save frametalk
```

## One way usage
Send a message to another frame.

```js
const frametalk = require('frametalk');

// Frame A: send a message to frame B
frametalk.send(frameB, 'hello', {foo: 'bar'});

// Frame B: receive message from frame A
frametalk.on('hello', (event, data) => {
  console.log(data); // output: {foo: 'bar'}
});
```

## Two way usage
Send a message to another frame and get a response back

```js
const frametalk = require('frametalk');

// Frame A: send request to frame B, and await reply
frametalk.request(frameB, 'getStatus')
  .then((res) => {
    console.log(res); // output: {status: 'OK'}
  });

// Frame B: receive message from frame A, and send reply back
frametalk.replyOn('getStatus', (event) => {
  return {status: 'OK'};
});
```

You can also respond with a promise:
```js
frametalk.replyOn('getStatus', (event) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({status: 'Still OK'});
    }, 1000);
  })
});
```
