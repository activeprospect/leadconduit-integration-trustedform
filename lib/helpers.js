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

const evalFingerprint = (lead, fingerprints) => {
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

const validate = (vars) => {
  const certUrl = _.get(vars.lead, 'trustedform_cert_url');
  if (!certUrl) return 'TrustedForm cert URL must not be blank';
  // example: https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985
  const tfRegex = /^https?:\/\/cert.trustedform.com\/[a-h0-9]{40}/;
  // example: https://cert.trustedform.com/0.YpUzjEEpW3vIkuEJFst4gSDQ7KiFGLZGYkTwIMzRXt8TxcnRUnx3p1U34EWx6KUZ9hyJUuwVm11qoEodrSfsXYDLS7LDFWOyeuCP2MNCHdnAXYkG.IW3iXaUjponmuoB4HNdsWQ.H6cCZ53mOpSXUtUlpdwlWw
  const tfFacebookRegex = /^https?:\/\/cert.trustedform.com\/0\./;
  // same as above but with staging
  const tfStagingRegex = /^https?:\/\/cert.staging.trustedform.com\/[a-h0-9]{40}/;
  const tfStagingFacebook = /^https?:\/\/cert.staging.trustedform.com\/0\./;

  const productionValid = (certUrl.match(tfRegex) || certUrl.match(tfFacebookRegex));
  const stagingValid = (process.env.NODE_ENV !== 'production' && (certUrl.match(tfStagingRegex) || certUrl.match(tfStagingFacebook)));

  if (!productionValid && !stagingValid) return 'TrustedForm cert URL must be valid';
};

module.exports = {
  ageInSeconds,
  timeOnPageInSeconds,
  formatScanReason,
  countRequiredMatched,
  evalFingerprint,
  formatUrl,
  validate
};
