const { RTMClient } = require('@slack/rtm-api');
const token = process.env.SLACK_BOT_TOKEN;

const rtm = new RTMClient(token);

(async () => {
  const { self, team } = await rtm.start();
})();