const Mixer = require('@mixer/client-node');
const ws = require('ws');
const Commands = require('./commands');

const CHANNEL = ''; // Channel you want to connect to.
const ACCESS_TOKEN = '';
// 1. Visit https://dev.mixer.com/guides/chat/chatbot
// 2. Click on node section.
// 3. Click on "access: 'Click here to get your Token!'" to get token.
const COOL_DOWN_TIME = 5; // In seconds

let isOnCoolDown;
let userInfo;
let channelId;
const commandsInstance = new Commands();

const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

// With OAuth we don't need to log in. The OAuth Provider will attach
// the required information to all of our requests after this call.

client.use(
  new Mixer.OAuthProvider(client, {
    tokens: {
      access: ACCESS_TOKEN,
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000
    }
  })
);

// .request('GET', 'users/current')
// Gets the user that the Access Token we provided above belongs to.
client
  .request('GET', `users/current`)
  .then(response => {
    // Store the logged in user's details for later reference
    userInfo = response.body;

    return new Promise(resolve => resolve());
  })
  .then(() => {
    // .request('GET', 'users/search')
    // Gets the channelID of the channel you are requesting and begins a ChatService.
    client
      .request('GET', `users/search?query=${CHANNEL}&limit=1`)
      .then(response => {
        channelId = response.body[0].channel.id;

        // Returns a promise that resolves with our chat connection details.
        return new Mixer.ChatService(client).join(channelId);
      })
      .then(response => {
        const body = response.body;

        return createChatSocket(
          userInfo.id,
          channelId,
          body.endpoints,
          body.authkey
        );
      })
      .catch(error => {
        console.error('Something went wrong.');
        console.error(error);
      });

    function createChatSocket(userId, channelId, endpoints, authkey) {
      const socket = new Mixer.Socket(ws, endpoints).boot();
      const defaultCommandsList = commandsInstance.getDefaultCommands();
      let customCommandsList = commandsInstance.getCustomCommands();

      socket.on('ChatMessage', data => {
        // Parse current command
        const command = data.message.message[0].data
          .toLowerCase()
          .split(' ')[0];

        const replyToCommand = () => {
          // Custom Commands
          // Check if current command is in customCommandsList
          const commandObject = customCommandsList.filter(
            currCommand => currCommand.command === command
          );
          // If command exist reply with correct message.
          if (commandObject[0]) {
            socket.call('msg', [
              `@${data.user_name} ${commandObject[0].reply}`
            ]);
          }

          // Functional commands --- TODO: Refactor to be cleaner.
          const defaultCommandObject = defaultCommandsList.filter(
            currCommand => currCommand.command === command
          );
          if (defaultCommandObject[0]) {
            // If command requires permissions and current user is allowed.
            if (
              defaultCommandObject[0].mod &&
              (data.user_roles.includes('Owner') ||
                data.user_roles.includes('Mod'))
            ) {
              //Returns true if command list needs to refresh.
              const updateCommands = defaultCommandObject[0].action(
                data,
                socket,
                commandsInstance,
                client,
                channelId
              );
              if (updateCommands) {
                customCommandsList = commandsInstance.getCustomCommands();
              }
            } // If command doesn't require permissions.
            else if (defaultCommandObject[0].mod === false) {
              //Returns true if command list needs to refresh.
              defaultCommandObject[0].action(
                data,
                socket,
                commandsInstance,
                client,
                channelId
              );
            }
          }
        };

        if (
          data.user_roles.includes('Owner') ||
          data.user_roles.includes('Mod')
        ) {
          replyToCommand();
        } else if (!isOnCoolDown) {
          replyToCommand();
          isOnCoolDown = true;
          setTimeout(() => (isOnCoolDown = false), COOL_DOWN_TIME * 1000);
        }
      });

      socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
      });

      return socket.auth(channelId, userId, authkey).then(() => {
        console.log('Login successful');
        return socket.call('msg', ['Bot has connected!']);
      });
    }
  });
