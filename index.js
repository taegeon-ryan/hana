require('dotenv').config();

const { RTMClient } = require('@slack/rtm-api');
const token = process.env.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);

rtm.on('message', (event) => {
  console.log(event);
});

(async () => {
  await rtm.start();
})();