({ http_event }) => {
  const parsed_body = JSON.parse(http_event.body);
  const intent = parsed_body.queryResult.intent.name;
  const parameters = parsed_body.queryResult.parameters;
  
  // fetch logs from AWS
  const log_events = api.run("this.filter_log_events", {
    instance: parameters.instance,
    requestId: parameters.requestId
  });
    
  // format a message for slack
  const message = [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `I searched \`${parameters.instance}\` for request \`${parameters.requestId}\` :`
    }
  }];
  if (log_events.length === 0) {
    message.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "_No logs matched_  :cry:"
      }
    });
  }
  for (const log_event of log_events) {
    const short_log_stream_name = log_event.logStreamName.substring(0, 7);
    const log_message = log_event.message;
    message.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `_(${short_log_stream_name}...)_\n\`\`\`${log_message}\`\`\``
      }
    });
  }
  
  // post message to slack
  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      payload: {
        slack: {
          attachments: [{
            blocks: message
          }]
        }
      }
    }
  };
}