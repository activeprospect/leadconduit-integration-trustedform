const crypto = require('crypto');
const _ = require('lodash');

const fingerprintedFieldNames = ['email', 'phone_1', 'phone_2', 'phone_3'];

const ageInSeconds = (event) => {
  const timeOnPage = timeOnPageInSeconds(event.cert.event_duration) || 0;
  const certAge = (new Date(event.created_at) - new Date(event.cert.created_at)) / 1000;
  return Math.round(certAge - timeOnPage);
};

const timeOnPageInSeconds = (eventDuration) => {
  if (!eventDuration || isNaN(eventDuration)) return null;
  return Math.round(parseInt(eventDuration) / 1000);
};

const formatScanReason = (scannedFor, textArray) => {
  const matches = textArray.filter(t => scannedFor.indexOf(t) >= 0);
  // sort text items for uniformity of reason across leads, and (arbitrarily) limit in case of long scan text
  return `${matches.length}: '${matches.sort().join(', ').substr(0, 255)}'`;
};

const countRequiredMatched = (requiredStrings, scans) => {
  // normalize data
  if (!(requiredStrings instanceof Array)) {
    requiredStrings = [requiredStrings];
  }

  if (scans.length === 0) return 'none';

  let requiredStringNotFound = false;
  requiredStrings.forEach(string => {
    if (scans.indexOf(string) === -1) {
      requiredStringNotFound = true;
    }
  });

  return (requiredStringNotFound) ? 'some' : 'all';
};

const evalFingerprint = (lead, fingerprints = { matching: [], non_matching: [] }) => {
  const result = {};

  if (fingerprints.matching.length) {
    result.fingerprints_summary = fingerprints.non_matching.length ? 'Some Matched' : 'All Matched';

    for (const field of fingerprintedFieldNames) {
      if (lead[field]) {
        const hashed = crypto.createHash('sha1').update(lead[field]).digest('hex');
        result[`${field}_fingerprint_matched`] = fingerprints.matching.includes(hashed);
      }
    }
  } else {
    // 'matching' array is empty
    result.fingerprints_summary = fingerprints.non_matching.length ? 'None Matched' : 'No Fingerprinting Data';
  }

  return result;
};

const formatUrl = (certUrl) => {
  // if tf_cert_url is stringified array (i.e., multiple values posted) then split, compact, and use the first one
  certUrl = (certUrl && certUrl.includes(','))
    ? _.compact(certUrl.split(','))[0]
    : certUrl;

  certUrl = certUrl.replace('http://', 'https://');
  return _.trimEnd(certUrl, '/');
};

// originally 40 lowercase hex digits; with advent of mobile certs,
// now 40 or 80 mixed case alphanumeric, plus dashes and underscores
const tfRegex = /^https?:\/\/cert.trustedform.com\/([-_a-zA-Z0-9]{40}|[-_a-zA-Z0-9]{80})$/;

// anything beginning with a "0."
const tfFacebookRegex = /^https?:\/\/cert.trustedform.com\/0\./;

// same as above, for staging
const tfStagingRegex = /^https?:\/\/cert.staging.trustedform.com\/([-_a-zA-Z0-9]{40}|[-_a-zA-Z0-9]{80})$/;
const tfStagingFacebook = /^https?:\/\/cert.staging.trustedform.com\/0\./;

const validate = (vars) => {
  const certUrl = _.get(vars.lead, 'trustedform_cert_url');
  if (!certUrl) return 'TrustedForm cert URL must not be blank';

  const productionValid = (tfRegex.test(certUrl) || tfFacebookRegex.test(certUrl));
  const stagingValid = (process.env.NODE_ENV !== 'production' && (tfStagingRegex.test(certUrl) || tfStagingFacebook.test(certUrl)));

  if (!productionValid && !stagingValid) return 'TrustedForm cert URL must be valid';
};

const configureClaimOptions = (lead, trustedform = {}, sourceName) => {
  const certUrl = formatUrl(lead.trustedform_cert_url);

  const host = (process.env.NODE_ENV === 'production') ? 'https://app.leadconduit.com' : 'https://app.leadconduit-staging.com';
  return {
    cert_url: certUrl,
    vendor: _.get(trustedform, 'vendor') || sourceName,
    reference: trustedform.custom_reference || `${host}/events/${lead.id}`,
    required_text: trustedform.scan_required_text,
    forbidden_text: trustedform.scan_forbidden_text,
    email: lead.email,
    phone_1: lead.phone_1,
    phone_2: lead.phone_2,
    phone_3: lead.phone_3
  };
};

module.exports = {
  ageInSeconds,
  timeOnPageInSeconds,
  formatScanReason,
  countRequiredMatched,
  evalFingerprint,
  formatUrl,
  configureClaimOptions,
  validate
};
