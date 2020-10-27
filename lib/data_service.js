const querystring = require('querystring');
const { get, uniq, omitBy, isUndefined } = require('lodash');
const { formatUrl, validate } = require('./helpers');

const request = (vars) => {
  if(!vars.token) vars.token = process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN;

  const { lead, trustedform } = vars;
  let body = {
    'scan[]': get(trustedform, 'scan_required_text'),
    'scan[]!': get(trustedform, 'scan_forbidden_text'),
    phone_1: lead.phone_1,
    phone_2: lead.phone_2,
    phone_3: lead.phone_3,
    email: lead.email
  }

  body = omitBy(body, (value) => {return isUndefined(value)});

  let req = {
    url: `${formatUrl(lead.trustedform_cert_url)}/peek`,
    method: 'POST',
    body: querystring.stringify(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${vars.token}`
    }
  }

  vars.token = Array(vars.token.length + 1).join('*');
  return req;
};

request.variables = () => [
  { name: 'lead.trustedform_cert_url', type: 'string', required: true, description: 'TrustedForm Certificate URL' },
  { name: 'trustedform.scan_required_text', type: 'array', required: false, description: 'Required text to search snapshot for' },
  { name: 'trustedform.scan_forbidden_text', type: 'array', required: false, description: 'Forbidden text to search snapshot for' },
  { name: 'trustedform.vendor', type: 'string', required: false, description: 'Lead vendor name sent to TrustedForm, defaults to the lead source name' },
  { name: 'lead.email', type: 'string', required: false, description: `Lead email that will be fingerprinted, defaults to the lead's "Email" field` },
  { name: 'lead.phone_1', type: 'string', required: false, description: `Lead phone 1 that will be fingerprinted, defaults to the lead's "Phone 1" field` },
  { name: 'lead.phone_2', type: 'string', required: false, description: `Lead phone 2 that will be fingerprinted, defaults to the lead's "Phone 2" field` },
  { name: 'lead.phone_3', type: 'string', required: false, description: `Lead phone 3 that will be fingerprinted, defaults to the lead's "Phone 3" field` }
];

const response = (vars, req, res) => {

  let event, cert;
  try {
    event = JSON.parse(res.body);
    if(event) cert = event.cert;
  } catch (e) {
    return {
      data_service: {
        outcome: 'error',
        reason: 'unable to parse response'
      }
    }
  }
  if (res.status === 201) {
    let found = (get(event, 'scans.found')) ? uniq(event.scans.found) : [];
    let notFound = (get(event, 'scans.not_found')) ? uniq(event.scans.not_found) : [];

    return {
      data_service: {
        outcome: 'success',
        age: event.age,
        browser: cert.browser,
        created_at: cert.created_at,
        device: cert.device,
        event_duration: cert.event_duration,
        expires_at: cert.expires_at,
        framed: cert.framed,
        city: get(cert, 'geo.city'),
        country_code: get(cert, 'geo.country_code'),
        lat: get(cert, 'geo.lat'),
        lon: get(cert, 'geo.lon'),
        postal_code: get(cert, 'geo.postal_code'),
        state: get(cert, 'geo.state'),
        time_zone: get(cert, 'geo.time_zone'),
        ip: cert.ip,
        wpm: cert.wpm,
        kpm: cert.kpm,
        page_url: cert.page_url,
        operating_system: cert.operating_system,
        parent_page_url: cert.parent_page_url,
        cert_id: cert.cert_id,
        user_agent: cert.user_agent,
        fingerprints_matching: get(event, 'fingerprints.matching'),
        fingerprints_non_matching: get(event, 'fingerprints.non_matching'),
        masked: event.masked,
        scans_found: found,
        scans_not_found: notFound,
        warnings: event.warnings
      }
    }
  }
  else if(res.status >= 400 && res.status < 500) {
    return {
      data_service: {
        outcome: 'failure',
        reason: get(event, 'errors.detail')
      }
    }
  }
  else {
    return {
      data_service: {
        outcome: 'error',
        reason: `unknown error (${res.status})`
      }
    }
  }
};

response.variables = () => [
  { name: 'data_service.outcome', type: 'string', description: 'Integration outcome (success, failure, or error)' },
  { name: 'data_service.reason', type: 'string', description: 'in case of failure, the reason for failure' },
  { name: 'data_service.age', type: 'number', description: 'Number of seconds since the certificate was created' },
  { name: 'data_service.browser', type: 'string', description: 'Human friendly version of user-agent' },
  { name: 'data_service.created_at', type: 'time', description: 'Time the user loaded the form in UTC ISO8601 format' },
  { name: 'data_service.device', type: 'string', description: 'Mobile device type, if applicable' },
  { name: 'data_service.event_duration', type: 'number', description: 'The amount of time, in seconds, that the consumer spent on the page filling out the form' },
  { name: 'data_service.expires_at', type: 'date', description: 'Timestamp indicating when the claim period for the TrustedForm certificate expires' },
  { name: 'data_service.framed', type: 'boolean', description: 'Whether or not the page_url was in an iframe' },
  { name: 'data_service.city', type: 'string', description: 'City name' },
  { name: 'data_service.country_code', type: 'string', description: 'Country code' },
  { name: 'data_service.lat', type: 'number', description: 'Latitude' },
  { name: 'data_service.lon', type: 'number', description: 'Longitude' },
  { name: 'data_service.postal_code', type: 'string', description: 'Mailing address postal code' },
  { name: 'data_service.state', type: 'string', description: 'State or province name' },
  { name: 'data_service.time_zone', type: 'string', description: 'Time zone name' },
  { name: 'data_service.ip', type: 'string', description: 'The IP address of the consumer' },
  { name: 'data_service.wpm', type: 'number', description: 'The consumer’s typing speed on the form, in words per minute' },
  { name: 'data_service.kpm', type: 'number', description: 'The consumer’s typing speed on the form, in keystrokes per minute' },
  { name: 'data_service.page_url', type: 'url', description: 'The URL of the page on which the consumer filled out the form' },
  { name: 'data_service.operating_system', type: 'string', description: 'The operating system for the device from which the consumer filled out the form' },
  { name: 'data_service.parent_page_url', type: 'url', description: 'The URL of the page on which the consumer filled out the form. The value will be “null” unless framed=true' },
  { name: 'data_service.cert_id', type: 'string', description: 'The TrustedForm certificate ID' },
  { name: 'data_service.user_agent', type: 'string', description: 'The browser and operating system for the device on which the consumer filled out the form' },
  { name: 'data_service.fingerprints_matching', type: 'array', description: 'Matching fingerprints that were found on the TrustedForm certificate' },
  { name: 'data_service.fingerprints_non_matching', type: 'array', description: 'Non-matching fingerprints that were found on the TrustedForm certificate' },
  { name: 'data_service.masked', type: 'boolean', description: 'Whether or not the TrustedForm certificate is masked' },
  { name: 'data_service.scans_found', type: 'array', description: 'Language that was found through the use of page scanning' },
  { name: 'data_service.scans_not_found', type: 'array', description: 'Language that was not found through the use of page scanning' },
  { name: 'data_service.warnings', type: 'array', description: 'Any warnings present about the content of the form, specific to page scanning and fingerprinting' }
]

module.exports = {
  validate,
  request,
  response
}
