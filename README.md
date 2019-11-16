<h1 align="center">Simple Mixer Chat Bot</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
</p>

> A simple chat bot for the [Mixer](https://mixer.com/) streaming service.

## Install

```sh
npm install
```

### Config

```js
Changes to app.js
const CHANNEL = ''; // Channel you want to connect to.
const ACCESS_TOKEN = ''; // Your Mixer access token.
const COOL_DOWN_TIME = 5; // In seconds
```

### Mixer access token

```
1. Visit https://dev.mixer.com/guides/chat/chatbot
2. Click on node section.
3. Scroll down to "Writing the Code".
4. Click on "access: 'Click here to get your Token!'" to get token.
```

## Usage

```sh
npm run start
```

### Commands

```
!addcommand - Add custom commands. Ex: !addcommand !mouse "My current mouse"
!delcommand - Delete custom commands.
!commands - List all current commands.
!pepo - Links a random pepe meme.
!roll - Rolls a number between 1-100
!viewers - Shows current viewer amount.
```

## Run tests

```sh
npm run test
```

## Author

👤 **Gilberto Gaspar**

- Github: [@GilbertoGaspar](https://github.com/GilbertoGaspar)
