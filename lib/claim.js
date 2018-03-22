const querystring = require('querystring');
const url = require('url');
const _ = require('lodash');

const content = (vars) => {

  const vendor = (vars.trustedform && vars.trustedform.vendor) ?
    vars.trustedform.vendor :
    vars.source.name;

  const params = {
    reference: `https://next.leadconduit.com/events/${vars.lead.id}`,
    vendor
  };

  if (vars.trustedform && vars.trustedform.scan_required_text) {
    // Convert scan_required_text to Array if it isn't already
    if (!(vars.trustedform.scan_required_text instanceof Array)) {
      vars.trustedform.scan_required_text = [ vars.trustedform.scan_required_text ];
    }
    params['scan[]'] = vars.trustedform.scan_required_text;
  }


  if (vars.trustedform && vars.trustedform.scan_forbidden_text) {
    if (!(vars.trustedform.scan_forbidden_text instanceof Array)) {
      vars.trustedform.scan_forbidden_text = [ vars.trustedform.scan_forbidden_text ];
    }
    params['scan![]'] = vars.trustedform.scan_forbidden_text;
  }

  if (vars.lead.email) params.email = vars.lead.email.toString();
  if (vars.lead.phone_1) params.phone_1 = vars.lead.phone_1.toString();
  if (vars.lead.phone_2) params.phone_2 = vars.lead.phone_2.toString();
  if (vars.lead.phone_3) params.phone_3 = vars.lead.phone_3.toString();

  return querystring.encode(params);
};

const encodeAuthentication = (apiKey) => `Basic ${new Buffer(`API:${apiKey}`).toString('base64')}`;

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
      Authorization:  encodeAuthentication(apiKey),
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
  { name: 'trustedform.api_key', type: 'string', required: false, description: 'Optional TrustedForm API key. Used for claiming certs that belong to another account' },
  { name: 'lead.email', type: 'string', required: false, description: `Lead email that will be fingerprinted, defaults to the lead's "Email" field` },
  { name: 'lead.phone_1', type: 'string', required: false, description: `Lead phone 1 that will be fingerprinted, defaults to the lead's "Phone 1" field` },
  { name: 'lead.phone_2', type: 'string', required: false, description: `Lead phone 2 that will be fingerprinted, defaults to the lead's "Phone 2" field` },
  { name: 'lead.phone_3', type: 'string', required: false, description: `Lead phone 3 that will be fingerprinted, defaults to the lead's "Phone 3" field` }
];


const validate = (vars) => {
  if (!vars.lead.trustedform_cert_url) return 'TrustedForm cert URL must not be blank';

  // Cert URLs should begin with 'https://cert.trustedform.com/'
  const tfRegex = /^https:\/\/cert.trustedform.com\//;
  if (!tfRegex.test(vars.lead.trustedform_cert_url)) return 'TrustedForm cert URL must be valid';
};


const ageInSeconds = (event) => {
  const timeOnPage = timeOnPageInSeconds(event.cert.event_duration) || 0;
  const certAge = (new Date(event.created_at) - new Date(event.cert.created_at)) / 1000;
  return Math.round(certAge - timeOnPage);
};

const timeOnPageInSeconds = (event_duration) => {
  if (!event_duration || isNaN(event_duration)) return null;
  return Math.round(parseInt(event_duration) / 1000);
};

const formatScanReason = (scannedFor, textArray)=> {
  const matches = textArray.filter(t => scannedFor.indexOf(t) >= 0);
  // sort text items for uniformity of reason across leads, and (arbitrarily) limit in case of long scan text
  return `${matches.length}: '${matches.sort().join(', ').substr(0, 255)}'`;
};

const response  = (vars, req, res) => {
  let appended = {};
  let event = {};

  try {
    event = JSON.parse(res.body);
  } catch(e) {
    event.message = 'unable to parse response' ;
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
        city: event.cert.geo.city,
        country_code: event.cert.geo.country_code,
        latitude: event.cert.geo.lat,
        longitude: event.cert.geo.lon,
        postal_code: event.cert.geo.postal_code,
        state: event.cert.geo.state,
        time_zone: event.cert.geo.time_zone
      },
      snapshot_url: event.cert.snapshot_url,
      masked_cert_url: event.masked_cert_url,
      is_masked: event.masked,
      share_url: event.share_url,
      url: hosted_url,
      domain: (hosted_url) ? url.parse(hosted_url).hostname : null,
      age_in_seconds: ageInSeconds(event),
      time_on_page_in_seconds: timeOnPageInSeconds(event.cert.event_duration),
      created_at: event.cert.created_at,
      scans: {
        found: found,
        not_found: notFound
      },
      duration: res.headers['X-Runtime']
    };

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
    }
  } else {
    const errorMessage = (event && event.message) ? event.message : '';
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
  { name: 'domain', type: 'string', description: 'Domain of the url' },
  { name: 'age_in_seconds', type: 'number', description: 'Number of seconds since the certificate was created' },
  { name: 'time_on_page_in_seconds', type: 'number', description: 'Number of seconds the consumer spent filling out the offer form' },
  { name: 'created_at', type: 'time', description: 'Time the user loaded the form in UTC ISO8601 format' },
  { name: 'is_masked', type: 'boolean', description: 'Whether the cert being claimed is masked'},
  { name: 'share_url', type: 'url', description: 'The expiring share URL of the certificate' },
  { name: 'scans.found', type: 'array', description: 'Forbidden scan terms found in the claim'},
  { name: 'scans.not_found', type: 'array', description: 'Required scan terms not found in the claim'},
  { name: 'duration', type: 'number', description: 'The number of seconds the API call took, according to TrustedForm'}
];


module.exports = {
  validate,
  request,
  response
};
