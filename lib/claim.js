const url = require('url');
const _ = require('lodash');
const { content, ageInSeconds, timeOnPageInSeconds, formatScanReason, countRequiredMatched, evalFingerprint } = require('./helpers.js');

const request = (vars) => {

  const apiKey = (vars.trustedform && vars.trustedform.api_key)
    ? vars.trustedform.api_key :
    vars.activeprospect.api_key;

  // if tf_cert_url is stringified array (i.e., multiple values posted) then split, compact, and use the first one
  let certUrl = (vars.lead.trustedform_cert_url && vars.lead.trustedform_cert_url.includes(',')) ?
    _.compact(vars.lead.trustedform_cert_url.split(','))[0] :
    vars.lead.trustedform_cert_url;

  return {
    url: certUrl,
    method: 'POST',
    headers: {
      Accept:        'application/json',
      Authorization:  `Basic ${new Buffer(`API:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: content(vars)
  };
};

request.variables = () => [
  { name: 'lead.trustedform_cert_url', type: 'string', required: true, description: 'TrustedForm Certificate URL' },
  { name: 'trustedform.scan_required_text', type: 'array', required: false, description: 'Required text to search snapshot for' },
  { name: 'trustedform.scan_forbidden_text', type: 'array', required: false, description: 'Forbidden text to search snapshot for' },
  { name: 'trustedform.vendor', type: 'string', required: false, description: 'Lead vendor name sent to TrustedForm, defaults to the lead source name' },
  { name: 'trustedform.api_key', type: 'credential', required: false, description: 'Optional TrustedForm API key. Used for claiming certs that belong to another account' },
  { name: 'lead.email', type: 'string', required: false, description: `Lead email that will be fingerprinted, defaults to the lead's "Email" field` },
  { name: 'lead.phone_1', type: 'string', required: false, description: `Lead phone 1 that will be fingerprinted, defaults to the lead's "Phone 1" field` },
  { name: 'lead.phone_2', type: 'string', required: false, description: `Lead phone 2 that will be fingerprinted, defaults to the lead's "Phone 2" field` },
  { name: 'lead.phone_3', type: 'string', required: false, description: `Lead phone 3 that will be fingerprinted, defaults to the lead's "Phone 3" field` }
];

const validate = (vars) => {
  const certUrl = _.get(vars.lead, 'trustedform_cert_url')
  if (!certUrl) return 'TrustedForm cert URL must not be blank';

  // example url: https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985
  const tfRegex = /^https:\/\/cert.trustedform.com\/[a-h0-9]{40}/;
  // Cert URLs should begin with 'https://cert.trustedform.com/'
  const tfFacebookRegex = /^https:\/\/cert.trustedform.com\//;
  if (!certUrl.match(tfRegex) && !certUrl.match(tfFacebookRegex)) return 'TrustedForm cert URL must be valid';
};

const response  = (vars, req, res) => {
  let appended = {};
  let event = {};

  try {
    event = JSON.parse(res.body);
  } catch(e) {
    event.message = (res.status === 404) ? res.body : 'unable to parse response';
  }

  if (res.status === 201 && event.cert) {
    let hosted_url = event.cert.parent_location || event.cert.location;

    let found = (event.scans && event.scans.found) ? _.uniq(event.scans.found) : [];
    let notFound = (event.scans && event.scans.not_found) ? _.uniq(event.scans.not_found) : [];

    appended = {
      outcome: 'success',
      reason: null,
      user_agent: event.cert.user_agent,
      browser: event.cert.browser,
      os: event.cert.operating_system,
      ip: event.cert.ip,
      location : {
        city: _.get(event, 'cert.geo.city', undefined),
        country_code: _.get(event, 'cert.geo.country_code', undefined),
        latitude: _.get(event, 'cert.geo.lat', undefined),
        longitude: _.get(event, 'cert.geo.lon', undefined),
        postal_code: _.get(event, 'cert.geo.postal_code', undefined),
        state: _.get(event, 'cert.geo.state', undefined),
        time_zone: _.get(event, 'cert.geo.time_zone', undefined)
      },
      snapshot_url: event.cert.snapshot_url,
      masked_cert_url: event.masked_cert_url,
      is_masked: event.masked,
      share_url: event.share_url,
      url: hosted_url,
      domain: (hosted_url) ? url.parse(hosted_url).hostname : null,
      website: {
        location: _.get(event, 'cert.location'),
        parent_location: _.get(event, 'cert.parent_location')
      },
      age_in_seconds: ageInSeconds(event),
      time_on_page_in_seconds: timeOnPageInSeconds(event.cert.event_duration),
      created_at: event.cert.created_at,
      scans: {
        found: found,
        not_found: notFound
      },
      duration: res.headers['X-Runtime'],
      warnings: event.warnings
    };

    Object.assign(appended, evalFingerprint(vars.lead, event.fingerprints));
    const requiredStrings = _.get(vars, 'trustedform.scan_required_text', null);
    if (requiredStrings) appended.scans.num_required_matched = countRequiredMatched(requiredStrings, appended.scans.found); // 'all', 'some', or 'none'

    if (event.warnings) {
      if (event.warnings.some((warning) => warning === 'string not found in snapshot')) {
        appended.outcome = 'failure';
        appended.reason  = `Required scan text not found in TrustedForm snapshot (missing ${formatScanReason(vars.trustedform.scan_required_text, notFound)})`;
      }

      if (event.warnings.some((warning) => warning === 'string found in snapshot')) {
        appended.outcome = 'failure';
        appended.reason  = (appended.reason) ? `${appended.reason}; ` : '';
        appended.reason += `Forbidden scan text found in TrustedForm snapshot (found ${formatScanReason(vars.trustedform.scan_forbidden_text, found)})`;
      }

      if (event.warnings.some((warning) => warning === 'snapshot scan failed') && requiredStrings) {
        appended.outcome = 'failure';
        appended.reason = 'snapshot scan failed';
      }
    }
  } else {
    let errorMessage = '';
    // 410 errors do not return a message, so one is added below
    if (res.status === 410) {
      errorMessage = 'The TrustedForm certificate already passed the 72-hour origination timeframe and can no longer be claimed.';
    } else if (event && event.message) {
      errorMessage = event.message;
    }

    appended = {
      outcome: 'error',
      reason:  `TrustedForm error - ${errorMessage} (${res.status})`
    };
  }

  return appended;
};

response.variables = () => [
  { name: 'outcome', type: 'string', description: 'certificate claim result' },
  { name: 'reason', type: 'string', description: 'in case of failure, the reason for failure' },
  { name: 'user_agent', type: 'string', description: 'Consumer browsers user-agent' },
  { name: 'browser', type: 'string', description: 'Human friendly version of user-agent' },
  { name: 'os', type: 'string', description: 'Human friendly version of the users operating system' },
  { name: 'ip', type: 'string', description: 'Consumers IP address' },
  { name: 'location.city', type: 'string', description: 'City name' },
  { name: 'location.country_code', type: 'string', description: 'Country code' },
  { name: 'location.latitude', type: 'number', description: 'Latitude' },
  { name: 'location.longitude', type: 'number', description: 'Longitude' },
  { name: 'location.postal_code', type: 'string', description: 'Mailing address postal code' },
  { name: 'location.state', type: 'string', description: 'State or province name' },
  { name: 'location.time_zone', type: 'string', description: 'Time zone name' },
  { name: 'snapshot_url', type: 'string', description: 'URL of the snapshot of the offer page as seen by the user' },
  { name: 'masked_cert_url', type: 'string', description: 'The certificate url that masks the lead source url and snapshot' },
  { name: 'url', type: 'string', description: 'Parent frames URL if the page is framed, or location of the page hosting the javascript' },
  { name: 'website.location', type: 'string', description: 'The URL of the page hosting the TrustedForm script ' },
  { name: 'website.parent_location', type: 'string', description: 'The parent frame URL when the page is framed ' },
  { name: 'domain', type: 'string', description: 'Domain of the url' },
  { name: 'age_in_seconds', type: 'number', description: 'Number of seconds since the certificate was created' },
  { name: 'time_on_page_in_seconds', type: 'number', description: 'Number of seconds the consumer spent filling out the offer form' },
  { name: 'created_at', type: 'time', description: 'Time the user loaded the form in UTC ISO8601 format' },
  { name: 'is_masked', type: 'boolean', description: 'Whether the cert being claimed is masked'},
  { name: 'share_url', type: 'url', description: 'The expiring share URL of the certificate' },
  { name: 'scans.found', type: 'array', description: 'Forbidden scan terms found in the claim'},
  { name: 'scans.not_found', type: 'array', description: 'Required scan terms not found in the claim'},
  { name: 'scans.num_required_matched', type: 'string', description: 'How many of the required strings were scanned? (all, some, none)'},
  { name: 'duration', type: 'number', description: 'The number of seconds the API call took, according to TrustedForm'},
  { name: 'fingerprints_summary', type: 'string', description: 'Summary of fingerprint matching, one of All Matched, Some Matched, None Matched, or No Fingerprinting Data' },
  { name: 'email_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of the email matched' },
  { name: 'phone_1_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_1 matched' },
  { name: 'phone_2_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_2 matched' },
  { name: 'phone_3_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_3 matched' },
  { name: 'warnings', type: 'array', description: 'Any warnings returned by the claim' }
];

module.exports = {
  validate,
  request,
  response
};
