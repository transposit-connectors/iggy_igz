# IggyIgz

IggyIgz is Tranposit's debugging Slack bot. Send @IggyIgz a DM on Slack and ask it to search AWS CloudWatch.

```
Hey @IggyIgz, find me logs for request id 536afde6-a0ba-4772-b9dc-aebe6e7e9b3d on prod
```

Fork this app and modify it to work for your own infrastructure.

## Set up Dialogflow

IggyIgz uses [Dialogflow](https://dialogflow.com/) for natural language processing.

1. Create a new account on Dialogflow's [console](https://console.dialogflow.com/) and create an agent for IggyIgz.

2. Train the agent to understand an intent: "Search by Request Id". Parameterize the intent with an `instance` ("staging" or "prod") and a `requestId` (a UUID).

3. Optionally, tell Dialogflow more about your parameters:

   - Set up a custom entity for `instance` so that synonyms are understood ("stage", "production", etc.)
   - Set a default value for `instance` so that providing a value is optional
   - Define a prompt for `requestId` so that your bot follows up if a value is missing

4. Send your agent test input in the Dialogflow UI. Correct mistakes to improve your agent.

5. Enable Dialogflow's Slack integration. You will need to create a new Slack app, grant it chat scopes, and configure it to send events to Dialogflow. Exact instructions are part of the Dialogflow UI.

6. Send a welcome message to your bot to test it out!

## Fulfillment via Transposit

To fulfill the "Search by Request Id" intent, implement a webhook in Transposit.

1. In this Transposit app, navigate to the deployed `fulfillment` endpoint and copy its URL.

2. In Dialogflow, configure fulfillment via webhook. Paste in the URL copied from Transposit. Remove the api_key query parameter and put its value in a header `X-API-KEY` instead. Last, edit your intent and enable webhook calls for fulfillment.

To check that your bot is working, change `fulfillment` to simply echo its payload into Slack. Commit and DM your bot.

```javascript
({ http_event }) => {
  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      payload: {
        slack: {
          text: `\`\`\`${JSON.stringify(
            http_event.parsed_body,
            null,
            2
          )}\`\`\``,
        },
      },
    },
  };
};
```

## Take over the conversation

Dialogflow gives you very little control over what your bot posts in Slack. To take over the conversation, use Transposit's Slack data connector instead.

In `fulfillment`, respond to Dialogflow with a HTTP 200 and an empty body. Call [`setImmediate`](https://www.transposit.com/docs/references/js-operations/#setimmediate) and post messages from there instead.

```javascript
({ http_event }) => {
  const slackRequest =
    http_event.parsed_body.originalDetectIntentRequest.payload.data;

  setImmediate(() => {
    api.run("slack.post_chat_message", {
      $body: {
        channel: slackRequest.event.channel,
        text: "Hello, World!",
      },
    });
  });

  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: {},
  };
};
```
