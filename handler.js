const axios = require("axios");
const querystring = require("querystring");

const jobcanExec = async command => {
  try {
    return await axios.post(
      "https://slack.com/api/chat.command",
      querystring.stringify({
        token: process.env.SLACK_TOKEN,
        channel: process.env.SLACK_CHANNEL,
        command: `/${command}`
      })
    );
  } catch (error) {
    return {
      status: error.response.status,
      data: error.response.data
    };
  }
};

const response = result => ({
  statusCode: result.status,
  body: JSON.stringify(result.data)
});

const isForbiddenTime = () => {
  // Lambda use UTC
  const current_hour = new Date().getHours();
  return 3 <= current_hour && current_hour < 7;
};

module.exports.jobcanWorktime = async (event, context) => {
  return response(await jobcanExec("jobcan_worktime"));
};

module.exports.jobcanTouch = async (event, context) => {
  if (isForbiddenTime()) {
    return response({
      status: 403,
      data: { message: "Forbidden" }
    });
  }

  return response(await jobcanExec("jobcan_touch"));
};
