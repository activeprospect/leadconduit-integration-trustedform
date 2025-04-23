const request = require('request');

module.exports = (req, res) => {
  const { apiKey } = req.query;
  if (!apiKey) return res.status(422).send({ error: 'missing required field: apiKey' });

  const trustedFormUrl = {
    'production': 'https://app.trustedform.com/account',
    'staging': 'https://app.staging.trustedform.com/account',
    'test': 'https://app.staging.trustedform.com/account',
    'development': 'https://app.trustedform-dev.com/account',
  };
  const url = trustedFormUrl[process?.env.NODE_ENV] || trustedFormUrl['development'];

  const options = {
    url,
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Basic ${Buffer.from(`X:${apiKey}`).toString('base64')}`
    },
  };

  request(options, (err, response, body) => {
    if (err) return res.status(422).send({ error: err.message });
    if (response.statusCode !== 200) {
      let message = '';
      try {
        message = JSON.parse(body).error;
      }
      catch (e) {
        message = `Error (${response.statusCode}); unable to parse response from TrustedForm`;
      }
      return res.status(response.statusCode).send({ error: message });
    }
    else {
      res.status(200).send(body);
    }
  });
};
