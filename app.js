const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000;

const app = express();

// Serve static files from 'public' folder (for chat.js, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Respond with plain text (not currently used on '/' because of chatApp route)
function respondText(req, res) {
  res.send('hi');
}

// Respond with JSON at /json route
function respondJson(req, res) {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
}

// 404 handler route if needed elsewhere
function respondNotFound(req, res) {
  res.status(404).send('Not Found');
}

// Echo endpoint to transform query input string
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Serve chat.html at root '/'
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

// Route registrations
app.get('/', chatApp);          // root serves chat app HTML
app.get('/json', respondJson);
app.get('/echo', respondEcho);

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});



function respondChat (req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}

app.get('/chat', respondChat);
const EventEmitter = require('events');

const chatEmitter = new EventEmitter();
/**
 * This endpoint will respond to the client with a stream of server sent events
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/sse', respondSSE);

function respondSSE (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}