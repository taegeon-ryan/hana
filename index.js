require('dotenv').config();

const { RTMClient } = require('@slack/rtm-api');
const token = process.env.SLACK_BOT_TOKEN;
const rtm = new RTMClient(token);

rtm.on('member_joined_channel', async (event) => {
  try {
    const reply = await rtm.sendMessage(`안녕, 친구들! <@${event.user}> 등장!`, event.channel)
    console.log('Message sent successfully', reply.ts);
  } catch (error) {
    console.log('An error occurred', error);
  }
});

rtm.on('message', async (event) => {
  try {
    const reply = await rtm.sendMessage(event.text, event.channel)
    console.log('Message sent successfully', reply.ts);
  } catch (error) {
    console.log('An error occurred', error);
  }
});

(async () => {
  await rtm.start();
})();