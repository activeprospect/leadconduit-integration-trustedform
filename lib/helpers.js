const querystring = require('querystring');

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


module.exports = {
  content,
  ageInSeconds,
  timeOnPageInSeconds,
  formatScanReason,
  countRequiredMatched
};
