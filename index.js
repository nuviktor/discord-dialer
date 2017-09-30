const config = require('./config');
const WebSocket = require('ws');
const Discord = require('discord.js');

const wss = new WebSocket.Server({ port: config.port });
const client = new Discord.Client();

var socket;

function isMessageAllowed(message) {
    const username = message.author.username;
    const discriminator = message.author.discriminator;

    for (let i = 0; i < config.users.length; i++)
        if (username == config.users[i].name &&
            discriminator == config.users[i].discriminator)
            return true;

    return false;
}

function isMessageCommand(message) {
    return message.content.startsWith(config.commandPrefix);
}

function stripPrefix(command) {
    return command.substring(config.commandPrefix.length);
}

client.login(config.discordToken);

wss.on('connection', ws => {
    console.log('New client connected');
    socket = ws;

    if (config.channel)
        ws.on('message', message => {
            let channel = client.channels.get(config.channel);
            channel.setTopic(message);
        });
});

client.on('message', message => {
    if (socket && isMessageCommand(message) && isMessageAllowed(message)) {
        const command = stripPrefix(message.content);
        console.log(`Sending command "${command}" to client`);
        socket.send(command);
    }
});
