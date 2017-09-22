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

function handleRedial(redialSpec) {
  var redialObject = parseRedialSpec(redialSpec);
  var number = processRedialObject(redialObject);

  redial = true;

  console.info('[Action] Dialing ' + number);
  session = dial(number);

  session.on('bye', function (request) {
    goodbye.play();
    if (redial)
      handleRedial(redialSpec);
  });
}

function handleCommand(cmd) {
  switch (cmd[0].toLowerCase()) {
    case 'dial':
      if (cmd.length > 1) {
        var number = cmd[1];

        console.info('[Action] Dialing ' + number);
        session = dial(number);

        session.on('bye', function (request) {
          goodbye.play();
        });
      }
    break;
    case 'redial':
      if (cmd.length > 1)
        handleRedial(cmd[1]);
      else
        redial = false;
    break;
    case 'bye':
      if (session) {
        console.info('[Action] Hanging up');
        session.bye();
      }
    break;
    case 'dtmf':
      if (cmd.length > 1 && session) {
        var dtmf = cmd[1];

        console.info('[Action] Sending DTMF ' + dtmf);
        session.dtmf(dtmf);
      }
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
