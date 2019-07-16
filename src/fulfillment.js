({ http_event }) => {
  console.log(http_event);

  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      payload: {
        slack: {
          text: "Hello, from Transposit!"
        }
      }
    }
  };
}