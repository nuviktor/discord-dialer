const config = require('./config');
const io = require('socket.io')(config.port);
const Discord = require('discord.js');

const client = new Discord.Client();

var socket;

function isMessageAllowed(message) {
  return message.author.username == config.user.name &&
         message.author.discriminator == config.user.discriminator;
}

function isMessageCommand(message) {
  return message.content.startsWith(config.commandPrefix);
}

client.login(config.discordToken);

io.on('connection', sock => {
  socket = sock;
});

client.on('message', message => {
  if (socket && isMessageAllowed(message) && isMessageCommand(message)) {
    console.log('Sending command "' + message.content + '" to client');
    socket.send(message.content);
  }
});
