// Loads the path module to work with directories
const path = require('path');

// Loads the events module and creates the chat app event emitter
const EventEmitter = require('events');
const chatEmitter = new EventEmitter();

// Loads the express module and points to the server port location
const express = require('express');
const port = process.env.PORT || 3000;

// Creates an app using the express function
const app = express();
// Points the app to use the public directory for app assets and styling
app.use(express.static(path.join(__dirname, 'public')));

// route statements to be executed when the server receives a request
// first route initializes the chat page at chat.html
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);
// I added another route so that the error message would be displayed
app.get('*', respondNotFound);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Function that returns the chat.html file used in the chat app
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}


// Function that returns JSON message if endpoint with JSON in URL is requested
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Function that returns an error message if the URL endpoint is not recognized by the request listener like /test
function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

// Event handler function that returns the echoed text if the URL endpoint is recognized by the request listener like /echo?input=fullstack

function respondEcho (req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Registers the /chat endpoint to receive messages from the client
function respondChat (req, res) {
  const { message } = req.query;
  chatEmitter.emit('message', message);
  res.end();
}

// Feeds the server messages to the client when a server event triggered by the client is received
function respondSSE (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });
  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);
  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}