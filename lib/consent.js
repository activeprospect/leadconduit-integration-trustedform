const { get } = require('lodash');
const { validate, configureClaimOptions, evalFingerprint, countRequiredMatched } = require('./helpers.js');
const Client = require('trustedform-api-client');

const handle = (vars, callback) => {
  const apiKey = get(vars, 'trustedform.api_key') ? vars.trustedform.api_key : vars.activeprospect.api_key;
  const client = new Client(apiKey);

  const options = configureClaimOptions(vars.lead, vars.trustedform, vars.source.name);
  options.headers = { 'api-version': '3.0' };

  client.claim(options, (err, res, body) => {
    if (err) {
      const parsed = parseResponse(res.statusCode, body, vars);
      return callback(null, {
        outcome: 'error',
        reason: parsed.reason || err.message
      });
    }
    callback(null, parseResponse(res.statusCode, body, vars));
  });
};

const requestVariables = () => [
  { name: 'lead.trustedform_cert_url', type: 'string', required: true, description: 'TrustedForm Certificate URL' },
  { name: 'trustedform.scan_required_text', type: 'array', required: false, description: 'Required text to search snapshot for' },
  { name: 'trustedform.scan_forbidden_text', type: 'array', required: false, description: 'Forbidden text to search snapshot for' },
  { name: 'trustedform.vendor', type: 'string', required: false, description: 'Lead vendor name sent to TrustedForm, defaults to the lead source name' },
  { name: 'trustedform.api_key', type: 'credential', required: false, description: 'Optional TrustedForm API key. Used for claiming certs that belong to another account' },
  { name: 'trustedform.custom_reference', type: 'string', required: false, description: 'Optional reference, defaults to the lead\'s url' },
  { name: 'trustedform.scan_delimiter', type: 'string', required: false, description: 'The character used to surround an asterisk and identify it as a wildcard (default: |)' },
  { name: 'lead.email', type: 'string', required: false, description: 'Lead email that will be fingerprinted, defaults to the lead\'s "Email" field' },
  { name: 'lead.phone_1', type: 'string', required: false, description: 'Lead phone 1 that will be fingerprinted, defaults to the lead\'s "Phone 1" field' },
  { name: 'lead.phone_2', type: 'string', required: false, description: 'Lead phone 2 that will be fingerprinted, defaults to the lead\'s "Phone 2" field' },
  { name: 'lead.phone_3', type: 'string', required: false, description: 'Lead phone 3 that will be fingerprinted, defaults to the lead\'s "Phone 3" field' }
];

// this data should only be present on "consent_plus_data" responses
const parseCertData = (cert) => {
  return {
    age_in_seconds: cert.age_seconds,
    city: get(cert, 'approx_ip_geo.city'),
    country_code: get(cert, 'approx_ip_geo.country_code'),
    latitude: get(cert, 'approx_ip_geo.lat'),
    longitude: get(cert, 'approx_ip_geo.lon'),
    postal_code: get(cert, 'approx_ip_geo.postal_code'),
    state: get(cert, 'approx_ip_geo.state'),
    time_zone: get(cert, 'approx_ip_geo.time_zone'),
    browser: get(cert, 'browser.full'),
    is_mobile: get(cert, 'is_mobile', cert.mobile),
    os: get(cert, 'operating_system.full'),
    token: cert.cert_id,
    time_on_page_in_seconds: Number.isInteger(cert.event_duration_ms) ? cert.event_duration_ms / 1000 : null,
    created_at: cert.created_at,
    expires_at: cert.expires_at,
    form_input_method: cert.form_input_method,
    is_framed: get(cert, 'is_framed', cert.framed),
    ip: cert.ip,
    kpm: cert.kpm,
    wpm: cert.wpm,
    page_url: cert.page_url,
    parent_page_url: cert.parent_page_url,
    domain: cert.domain
  };
};

const parseResponse = (statusCode, body, vars) => {
  let appended = {};
  const event = body;

  if (statusCode === 201) {
    appended = {
      outcome: event.outcome || 'success',
      reason: event.reason || null,
      is_masked: get(event, 'is_masked', event.masked),
      masked_cert_url: event.masked_cert_url,
      warnings: event.warnings
    };

    Object.assign(appended, evalFingerprint(vars.lead, event.fingerprints));

    if (get(event, 'scans.forbidden_found')) appended.forbidden_scans_found = get(event, 'scans.forbidden_found');
    if (get(event, 'scans.forbidden_not_found')) appended.forbidden_scans_not_found = get(event, 'scans.forbidden_not_found');
    if (get(event, 'scans.required_found')) appended.required_scans_found = get(event, 'scans.required_found');
    if (get(event, 'scans.required_not_found')) appended.required_scans_not_found = get(event, 'scans.required_not_found');

    if (get(vars, 'trustedform.scan_required_text')) {
      // 'all', 'some', or 'none'
      appended.num_required_matched = countRequiredMatched(get(vars, 'trustedform.scan_required_text'), appended.required_scans_found);
    }

    // cert data should only exist on 'consent_plus_data' responses, but only
    // use it if the plusData flag set by that integration is set
    if (vars.plusData && event.cert && Object.keys(event.cert).length > 0) {
      Object.assign(appended, parseCertData(event.cert));
    }
  } else {
    // handle all non-201 statuses
    let errorMessage = get(event, 'errors.detail');
    if (errorMessage === 'Unauthorized' || event.outcome === 'failure') {
      appended.outcome = 'failure';
    } else {
      appended.outcome = 'error';
      // 410 errors do not return a message, so one is added below
      if (statusCode === 410) {
        errorMessage = 'The TrustedForm certificate already passed the 72-hour origination timeframe and can no longer be claimed.';
      } else if (event && event.message) {
        errorMessage = event.message;
      }
    }
    appended.reason = errorMessage ? `TrustedForm error - ${errorMessage} (${statusCode})` : event.reason;
  }

  return appended;
};

const responseVariables = () => [
  { name: 'outcome', type: 'string', description: 'certificate claim result' },
  { name: 'reason', type: 'string', description: 'in case of failure, the reason for failure' },
  { name: 'masked_cert_url', type: 'string', description: 'The certificate url that masks the lead source url and snapshot' },
  { name: 'is_masked', type: 'boolean', description: 'Whether the cert is masked' },
  { name: 'required_scans_found', type: 'array', description: 'List of required scan terms found' },
  { name: 'required_scans_not_found', type: 'array', description: 'List of required scan terms not found' },
  { name: 'num_required_matched', type: 'string', description: 'How many of the required strings were scanned? (all, some, none)' },
  { name: 'forbidden_scans_found', type: 'array', description: 'List of forbidden scan terms found' },
  { name: 'forbidden_scans_not_found', type: 'array', description: 'List of forbidden scan terms not found' },
  { name: 'fingerprints_summary', type: 'string', description: 'Summary of fingerprint matching, one of All Matched, Some Matched, None Matched, or No Fingerprinting Data' },
  { name: 'email_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of the email matched' },
  { name: 'phone_1_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_1 matched' },
  { name: 'phone_2_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_2 matched' },
  { name: 'phone_3_fingerprint_matched', type: 'boolean', description: 'True if the fingerprint of phone_3 matched' },
  { name: 'warnings', type: 'array', description: 'Any warnings returned by the claim' }
];

module.exports = {
  validate,
  handle,
  parseResponse,
  requestVariables,
  responseVariables
};
