var config = {
  uri: 'web@asterisk.lan',
  ws_servers: 'wss://asterisk.lan:8089/ws',
  authorizationUser: 'web',
  password: 'web',
  hackIpInContact: true,
  rtcpMuxPolicy: 'negotiate'
};

var ua = new SIP.UA(config);
var socket = io('https://dialer.lan');
var session;

function dial(number) {
  return ua.invite('sip:' + number + '@asterisk.lan', {
     media: {
         constraints: { audio: true, video: false },
         render: {
            remote: document.getElementById('remote-video'),
            local: document.getElementById('local-video')
         }
     }
  });
}

function onMessage(message) {
  if (message.startsWith('!')) {
    var cmd = message.split(' ');
    console.log('[Command] ' + cmd);

    switch (cmd[0]) {
      case '!dial':
        if (cmd.length > 1)
          session = dial(cmd[1]);
      break;
      case '!bye':
        if (session) session.bye();  
      break;
      case '!dtmf':
        if (cmd.length > 1) {
          var num = parseInt(cmd[1]); 
          if (num && session)
            session.dtmf(num);
        }
      break;
    }
  }
}

socket.on('connect', function () {
  socket.on('message', onMessage);
});
