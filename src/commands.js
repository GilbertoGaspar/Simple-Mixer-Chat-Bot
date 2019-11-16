const fileSystem = require('./filesystem');

let instance = null;

class Commands {
  constructor() {
    if (!instance) {
      instance = this;
    }

    this.pepoList = [];

    this.customCommandsList = [
      {
        command: '!ping',
        reply: 'PONG!'
      }
    ];

    fileSystem.readPeposJson(pepos => instance.setPepos(pepos));

    fileSystem.readCommandConfig(commands =>
      instance.setCustomCommands(commands)
    );

    this.defaultCommandsList = [
      {
        command: '!addcommand',
        mod: true,
        action(data, socket, instanceOfCommands) {
          const commandToAdd = {
            command: data.message.message[0].data.toLowerCase().split(' ')[1],
            reply: data.message.message[0].data.split(`"`)[1]
          };
          let customCommandsList = instanceOfCommands.getCustomCommands();
          if (
            customCommandsList.filter(
              currCommand => currCommand.command === commandToAdd.command
            ).length > 0
          ) {
            socket.call('msg', [
              `@${data.user_name} ${commandToAdd.command} is already on the command list.`
            ]);
          } else if (commandToAdd.command[0] === '!' && commandToAdd.reply) {
            customCommandsList.push(commandToAdd);
            instanceOfCommands.setCustomCommands(customCommandsList);
            fileSystem.writeCommandConfig(customCommandsList);
            socket.call('msg', [
              `@${data.user_name} ${commandToAdd.command} has been added to command list.`
            ]);
            return true;
          } else {
            socket.call('msg', [
              `@${data.user_name} ${commandToAdd.command} is not the proper formating for a command. Ex: " !addcommand !commandname "Say This" ".`
            ]);
          }
        }
      },
      {
        command: '!delcommand',
        mod: true,
        action(data, socket, instanceOfCommands) {
          const commandToDelete = data.message.message[0].data
            .toLowerCase()
            .split(' ')[1];
          if (
            instanceOfCommands
              .getCustomCommands()
              .filter(currCommand => currCommand.command === commandToDelete)
              .length === 0
          ) {
            socket.call('msg', [
              `@${data.user_name} ${commandToDelete} is not a command.`
            ]);
          } else {
            let customCommandsList = instanceOfCommands
              .getCustomCommands()
              .filter(currCommand => currCommand.command !== commandToDelete);
            instanceOfCommands.setCustomCommands(customCommandsList);
            fileSystem.writeCommandConfig(customCommandsList);
            socket.call('msg', [
              `@${data.user_name} ${commandToDelete} has been deleted from command list.`
            ]);
            return true;
          }
        }
      },
      {
        command: '!commands',
        mod: false,
        action(data, socket, instanceOfCommands) {
          // Joins default and custom commandList's command names together as a string.
          let commands = instanceOfCommands
            .getDefaultCommands()
            .map(currCommand => currCommand.command)
            .concat(
              instanceOfCommands
                .getCustomCommands()
                .map(currCommand => currCommand.command)
            )
            .join(' ');
          socket.call('msg', [`@${data.user_name} ${commands}`]);
        }
      },
      {
        command: '!pepo',
        mod: false,
        action(data, socket, instanceOfCommands) {
          // Replies with a random link of a pepe meme.
          const randomNum = Math.floor(
            Math.random() * instanceOfCommands.getPepos().length
          );
          const randomPepo = instanceOfCommands.getPepos()[randomNum];
          socket.call('msg', [`@${data.user_name} ${randomPepo}`]);
        }
      },
      {
        command: '!roll',
        mod: false,
        action(data, socket) {
          // Replies with a random number from 1-100.
          const randomNum = Math.floor(Math.random() * 100);
          socket.call('msg', [`@${data.user_name} You rolled a ${randomNum}!`]);
        }
      },
      {
        command: '!viewers',
        mod: false,
        action(data, socket, instanceOfCommands, client, channelId) {
          client.request('GET', `channels/${channelId}`).then(res => {
            const viewers = res.body.viewersTotal;
            socket.call('msg', [
              `@${data.user_name} There are currently ${viewers} viewers...`
            ]);
          });
        }
      }
    ];

    return instance;
  }

  getCustomCommands() {
    return this.customCommandsList;
  }

  getDefaultCommands() {
    return this.defaultCommandsList;
  }

  getPepos() {
    return this.pepoList;
  }

  setCustomCommands(commands) {
    this.customCommandsList = commands;
  }

  setDefaultCommands(commands) {
    this.defaultCommandsList = commands;
  }

  setPepos(pepos) {
    this.pepoList = pepos;
  }
}

module.exports = Commands;
