({ http_event }) => {
  const parsed_body = JSON.parse(http_event.body);

  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      payload: {
        slack: {
          text: `\`\`\`${JSON.stringify(parsed_body, null, 2)}\`\`\``
        }
      }
    }
  };
}