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
    console.info('[Action] Dialing ' + number);
    socket.send('Dialing ' + number);

    return ua.invite('sip:' + number + '@asterisk.lan', {
        media: {
            constraints: { audio: true, video: false },
            render: {
                remote: document.getElementById('remote-video')
            }
        }
    });
}

function byeCallback() {
    console.info('[Info] Call ended');
    socket.send('Call ended');
    goodbye.play();
}

function handleRedial(spec) {
    var object = parseRedialSpec(spec);
    var number = processRedialObject(object);

    session = dial(number);
    session.on('bye', function (request) {
        byeCallback()

        if (redial)
            setTimeout(function () {
                handleRedial(spec);
            }, getRandomInt(3000, 7000));
        else
            console.info('[Info] Redial terminated');
    });
}

function handleCommand(cmd) {
    switch (cmd[0].toLowerCase()) {
    case 'dial':
        if (cmd.length > 1 && ! redial) {
            if (session)
                session.bye();

            session = dial(cmd[1]);
            session.on('bye', byeCallback);
        }
    break;
    case 'redial':
        if (cmd.length > 1) {
            if (! redial) {
                console.info('[Action] Commencing redial');
                redial = true;
                handleRedial(cmd[1]);
            }
        } else if (redial) {
            console.info('[Action] Terminating redial');
            redial = false;
        }
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
