const { IncomingWebhook } = require('@slack/webhook');
const url = process.env.SLACK_WEBHOOK_URL;

const webhook = new IncomingWebhook(url);

// subscribeSlack is the main function called by Cloud Functions.
module.exports.subscribeSlack = (pubSubEvent, context) => {
  const build = eventToBuild(pubSubEvent.data);

  // Skip if the current status is not in the status list.
  // Add additional statuses to list if you'd like:
  // QUEUED, WORKING, SUCCESS, FAILURE,
  // INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return;
  }

  // Send message to Slack.
  const message = createSlackMessage(build);
  (async () => {
    try {
        let result = await webhook.send(message);
        if (result.text != 'ok') {
            console.error(result);
        }
    } catch (e) {
        console.error(e);
    }
  })();
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
}

// createSlackMessage creates a message from a build object.
const createSlackMessage = (build) => {
  console.log(JSON.stringify(build));

  const message = {
    text: `Build \`${build.status}\``,
    mrkdwn: true,
    attachments: [
      {
        title: 'Build logs',
        title_link: build.logUrl,
        fields: [{
          title: 'Status',
          value: build.status
        }]
      }
    ]
  };

  console.log(JSON.stringify(build.source));
  if(build.source.repoSource.repoName !== undefined)
    message.attachments[0].fields.push({ title: "Repo", value: build.source.repoSource.repoName });

  if(build.finishTime !== undefined)
    message.attachments[0].fields.push({ title: "Finished", value: (new Date(build.finishTime)).toLocaleString('en-GB', {timeZone: "Australia/Brisbane"}) });

  return message;
}
