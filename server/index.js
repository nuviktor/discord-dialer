const config = require('./config');
const io = require('socket.io')(config.port);
const Discord = require('discord.js');

const client = new Discord.Client();

var socket;

function isMessageAllowed(message) {
  const username = message.author.username;
  const discriminator = message.author.discriminator;

  for (i = 0; i < config.users.length; i++) {
    if (username == config.users[i].name &&
        discriminator == config.users[i].discriminator)
      return true;
  }

  return false;
}

function isMessageCommand(message) {
  return message.content.startsWith(config.commandPrefix);
}

client.login(config.discordToken);

io.on('connection', sock => {
  console.log('New client connected');
  socket = sock;
});

client.on('message', message => {
  if (socket && isMessageAllowed(message) && isMessageCommand(message)) {
    console.log('Sending command "' + message.content + '" to client');
    socket.send(message.content);
  }
});
