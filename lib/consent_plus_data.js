const consent = require('./consent');

const handle = (vars, callback) => {
  vars.plusData = true;
  consent.handle(vars, callback);
};

const responseVariables = () => {
  return consent.responseVariables().concat([
    { name: 'age_in_seconds', type: 'number', description: 'Number of seconds since the last user interaction with the certificate' },
    { name: 'city', type: 'string', description: 'City name based on IP address' },
    { name: 'country_code', type: 'string', description: 'Country based on IP address' },
    { name: 'latitude', type: 'number', description: 'Latitude based on IP address' },
    { name: 'longitude', type: 'number', description: 'Longitude based on IP address' },
    { name: 'postal_code', type: 'string', description: 'Mailing address postal code based on IP address' },
    { name: 'state', type: 'string', description: 'State or province name based on IP address' },
    { name: 'time_zone', type: 'string', description: 'Time zone name based on IP address' },
    { name: 'browser', type: 'string', description: 'Human friendly version of user-agent' },
    { name: 'is_mobile', type: 'boolean', description: 'True if the user device is a mobile device' },
    { name: 'os', type: 'string', description: 'Human friendly version of the users operating system' },
    { name: 'token', type: 'string', description: 'The TrustedForm certificate token' },
    { name: 'time_on_page_in_seconds', type: 'number', description: 'Number of seconds the consumer spent filling out the offer form' },
    { name: 'created_at', type: 'time', description: 'Time the user loaded the form in UTC ISO8601 format' },
    { name: 'expires_at', type: 'time', description: 'Time the cert would have expired if not claimed' },
    { name: 'form_input_method', type: 'array', description: 'The input method or methods the consumer used to fill out the form: autofill, paste, typing' },
    { name: 'is_framed', type: 'boolean', description: 'True if the page_url was in an iframe' },
    { name: 'ip', type: 'string', description: 'Consumer\'s IP address' },
    { name: 'kpm', type: 'number', description: 'Consumer\'s typing speed on the form, in keystrokes per minute' },
    { name: 'wpm', type: 'number', description: 'Consumer\'s typing speed on the form, in words per minute' },
    { name: 'page_url', type: 'string', description: 'The URL of the page hosting the TrustedForm script ' },
    { name: 'parent_page_url', type: 'string', description: 'The parent frame URL when the page is framed ' }
  ]);
};

module.exports = {
  validate: consent.validate,
  handle,
  parseResponse: consent.parseResponse,
  requestVariables: consent.requestVariables,
  responseVariables
};
