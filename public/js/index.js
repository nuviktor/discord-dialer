var config = {
  uri: 'web@asterisk.lan',
  wsServers: 'wss://asterisk.lan:8089/ws',
  authorizationUser: 'web',
  password: 'web'
};

var ua = new SIP.UA(config);
var socket = io('https://dialer.lan');
var goodbye = new Audio('audio/goodbye.wav');
var session;
var redial = false;

function dial(number) {
  return ua.invite('sip:' + number + '@asterisk.lan', {
     media: {
       constraints: { audio: true, video: false },
       render: {
         remote: document.getElementById('remote-video')
       }
     }
  });
}

function handleCommand(cmd) {
  switch (cmd[0].toLowerCase()) {
    case 'dial':
      if (cmd.length > 1) {
        session = dial(cmd[1]);
        session.on('bye', function (request) {
          goodbye.play();
        });
      }
    break;
    case 'redial':
      if (cmd.length > 1) {
        var redialSpec = cmd[1];
        var redialObject = parseRedialSpec(redialSpec);
        var number = processRedialObject(redialObject);

        redial = true;

        console.info('[Action] Dialing ' + number);
        session = dial(number);

        session.on('bye', function (request) {
          goodbye.play();
          if (redial)
            handleCommand(['redial', redialSpec]);
        });
      } else {
        redial = false;
      }
    break
    case 'bye':
      if (session)
        session.bye();
    break;
    case 'dtmf':
      if (cmd.length > 1 && session)
        session.dtmf(cmd[1]);
    break;
  }
}

function onMessage(message) {
  var cmd = message.split(/\s+/);
  console.info('[Command] ' + cmd);
  handleCommand(cmd);
}

socket.on('connect', function () {
  socket.on('message', onMessage);
});
