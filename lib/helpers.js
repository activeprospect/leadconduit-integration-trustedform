const crypto = require('crypto');

const fingerprintedFieldNames = ['email', 'phone_1', 'phone_2', 'phone_3'];

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

  let result = {};

  if(fingerprints.matching.length) {
    result.fingerprints_summary = fingerprints.non_matching.length ? "Some Matched" : "All Matched";

    for(let field of fingerprintedFieldNames) {
      if(lead[field]) {
        let hashed = crypto.createHash('sha1').update(lead[field]).digest('hex');
        result[`${field}_fingerprint_matched`] = fingerprints.matching.includes(hashed);
      }
    }
  }
  else {
    // 'matching' array is empty
    result.fingerprints_summary = fingerprints.non_matching.length ? "None Matched" : "No Fingerprinting Data";
  }

  return result;
};

module.exports = {
  ageInSeconds,
  timeOnPageInSeconds,
  formatScanReason,
  countRequiredMatched,
  evalFingerprint
};
