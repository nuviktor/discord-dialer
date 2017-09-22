# Discord dialer

Minimal Discord dialer that connects to Discord and relays back commands to the phone (a web page with SIP.js). Requires a WebRTC-compatible SIP server. May serve as inspiration for your own.

Once you've navigated to the client web page you'll need to link it up with Discord through audio routing as you would with a normal dialer.

Tested with latest Firefox (55) and Asterisk (14.6).

The `public/audio/goodbye.wav` is borrowed from the Asterisk sounds collection and thus respects its licence. Please see `public/audio/LICENCE` for more.

## Commands

* `dial NUMBER`
* `dtmf DIGITS`, example `dtmf 12#`
* `redial [REDIAL SPEC]`, see next section
* `bye`

## Redial feature

The dialer has a redial feature which allows for automatic redialing and caller ID switching. For example, if your dialplan allows you to set the caller ID to `15417543010` by calling `5551234567*5417543010`, you can keep redialing with a random caller ID each time by issuing the following command:

`redial 5551234567*NXXNXXXXXX`

This will keep calling `5551234567` with a random caller ID each time.

* `X` represents a random digit from 0 to 9.
* `Z` represents a random digit from 1 to 9.
* `N` represents a random digit from 2 to 9.

You can also use specific numbers, or a random selection of numbers of your choice using square brackets:

`redial 5551234567*[555,541]NXXXXXX`

This will randomly select `555` or `541` for the first three digits each time, and the rest of the digits will be random.

You can stop redialing by issuing the `redial` command again but with no arguments.

*This feature should not be misused and should be used only against fraudulent schemes. For that reason, I've left a lot of information about the setup quite vague, so that not just anyone can take advantage of the feature.*

## Layout

```
+-------------------------+
|                         |
|      Discord API        |
|                         |
+-+---------------------+-+
  |                     |
  |  Discord messages   |
  |                     |
+-v---------------------v-+
|                         |
| node index.js (server)  |
|                         |
+-+---------------------+-+
  |                     |
  |     WebSockets      |
  |                     |           +------------------------+
+-v---------------------v-+         |                        |
|                         +--------->  WebRTC-compatible     |
|  Browser (index.html)   |         |  SIP server            |
|                         <---------+                        |
+-+---------------------^-+         |                        |
  |                     |           +------------------------+
  |    Audio routing    |
  |                     |
+-v---------------------+-+
|                         |
|    Discord client       |
|                         |
+-------------------------+
```

## Todo

* Make the client configuration modifiable through a form that stores data in the browser's local storage.
* Consider adding other audio responses for certain events.
