const helpers = require('./helpers');
const { compact, get, pickBy, isUndefined } = require('lodash');

const request = (vars) => {
  const { lead, trustedform, insights } = vars;
  const body = {};

  if (trustedform.retain.valueOf() && (lead.email || lead.phone_1)) {
    body.match_lead = {
      email: lead.email,
      phone: lead.phone_1
    };
    body.retain = {
      reference: trustedform.custom_reference || `${helpers.getLeadConduitUrl()}/events/${lead.id}`,
      vendor: trustedform.vendor || vars.source.name
    };
  }

  if (trustedform.insights.valueOf()) {
    body.insights = {
      properties: formatProperties(insights)
    };
    if (insights.page_scan?.valueOf()) {
      body.insights.scans = {
        required: trustedform.scan_required_text,
        forbidden: trustedform.scan_forbidden_text,
        delimiter: get(trustedform, 'scan_delimiter', '|'),
      };
    }
  }

  if (trustedform.verify?.valueOf()) {
    const advertiserName = trustedform?.advertiser_name;
    body.verify = pickBy({ advertiser_name: advertiserName }, (v) => { return !isUndefined(v); });
  }

  return {
    method: 'POST',
    url: lead.trustedform_cert_url.toString(),
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'api-version': '4.0',
      Authorization: `Basic ${Buffer.from(`X:${trustedform.api_key || vars.activeprospect.api_key}`).toString('base64')}`
    }
  };
};

const formatProperties = (insights) => {
  const insightsProps = [
    { mapping: 'age', value: 'age_seconds' },
    { mapping: 'location', value: 'approx_ip_geo' },
    { mapping: 'browser', value: 'browser' },
    { mapping: 'created_timestamp', value: 'created_at' },
    { mapping: 'domain', value: 'domain' },
    { mapping: 'expiration_timestamp', value: 'expires_at' },
    { mapping: 'form_input_kpm', value: 'form_input_kpm' },
    { mapping: 'form_input_method', value: 'form_input_method' },
    { mapping: 'form_input_wpm', value: 'form_input_wpm' },
    { mapping: 'ip_address', value: 'ip' },
    { mapping: 'framed', value: 'is_framed' },
    { mapping: 'masked', value: 'is_masked' },
    { mapping: 'sensitive_content', value: 'num_sensitive_content_elements' },
    { mapping: 'sensitive_form_fields', value: 'num_sensitive_form_elements' },
    { mapping: 'operating_system', value: 'os' },
    { mapping: 'page_url', value: 'page_url' },
    { mapping: 'parent_page_url', value: 'parent_page_url' },
    { mapping: 'time_on_page', value: 'seconds_on_page' }
  ];

  let selectedProps = insightsProps.map((field) => {
    if (insights?.[field.mapping]?.valueOf()) return field.value;
  });

  return compact(selectedProps);
};

request.variables = () => [
  { name: 'lead.trustedform_cert_url', type: 'trustedform_url', required: true, description: 'TrustedForm Certificate URL' },
  { name: 'lead.email', type: 'string', required: false, description: `The email of the consumer you believe was recorded in the certificate; defaults to the lead's "Email" field.` },
  { name: 'lead.phone_1', type: 'string', required: false, description: `The phone number of the consumer you believe was recorded in the certificate; defaults to the lead's "Phone 1" field.`},
  { name: 'trustedform.api_key', type: 'string', required: false, description: 'Optional TrustedForm API key. Used for claiming certs that belong to another account' },

  { name: 'trustedform.retain', type: 'boolean', required: true, description: 'If true, a request to the Retain product will be made' },
  { name: 'trustedform.custom_reference', type: 'string', required: false, description: `Any text that may help you identify the lead associated with the certificate, such as a unique lead identifier or URL pointing to the lead in another system; defaults to the lead's url.` },
  { name: 'trustedform.vendor', type: 'string', required: false, description: `The name of the company that provided the lead associated with the certificate; defaults to the lead source's name.` },

  { name: 'trustedform.insights', type: 'boolean', required: true, description: 'If true, a request to the Insights product will be made' },
  { name: 'insights.age', type: 'boolean', required: false, description: 'Request TrustedForm Insights age data?' },
  { name: 'insights.browser', type: 'boolean', required: false, description: 'Request TrustedForm Insights browser data?' },
  { name: 'insights.created_timestamp', type: 'boolean', required: false, description: 'Request TrustedForm Insights created timestamp data?' },
  { name: 'insights.domain', type: 'boolean', required: false, description: 'Request TrustedForm Insights domain data?' },
  { name: 'insights.expiration_timestamp', type: 'boolean', required: false, description: 'Request TrustedForm Insights expiration timestamp data?' },
  { name: 'insights.framed', type: 'boolean', required: false, description: 'Request TrustedForm Insights framed data?' },
  { name: 'insights.form_input_method', type: 'boolean', required: false, description: 'Request TrustedForm Insights form input method data?' },
  { name: 'insights.form_input_kpm', type: 'boolean', required: false, description: 'Request TrustedForm Insights form input KPM data?' },
  { name: 'insights.form_input_wpm', type: 'boolean', required: false, description: 'Request TrustedForm Insights form input WPM data?' },
  { name: 'insights.ip_address', type: 'boolean', required: false, description: 'Request TrustedForm Insights IP address data?' },
  { name: 'insights.location', type: 'boolean', required: false, description: 'Request TrustedForm Insights location data?' },
  { name: 'insights.masked', type: 'boolean', required: false, description: 'Request TrustedForm Insights masked data?' },
  { name: 'insights.sensitive_content', type: 'boolean', required: false, description: 'Request TrustedForm Insights sensitive content data?' },
  { name: 'insights.sensitive_form_fields', type: 'boolean', required: false, description: 'Request TrustedForm Insights sensitive form fields data?' },
  { name: 'insights.operating_system', type: 'boolean', required: false, description: 'Request TrustedForm Insights operating system data?' },
  { name: 'insights.parent_page_url', type: 'boolean', required: false, description: 'Request TrustedForm Insights parent page URL data?' },
  { name: 'insights.time_on_page', type: 'boolean', required: false, description: 'Request TrustedForm Insights time on page data?' },
  { name: 'insights.page_url', type: 'boolean', required: false, description: 'Request TrustedForm Insights page URL data?' },
  { name: 'insights.page_scan', type: 'boolean', required: false, description: 'Request TrustedForm Insights page scan data?' },
  { name: 'trustedform.scan_required_text', type: 'array', required: false, description: 'A list of required text to scan for. TrustedForm will then perform a case and whitespace insensitive search for the string.' },
  { name: 'trustedform.scan_forbidden_text', type: 'array', required: false, description: 'A list of forbidden text to scan for. TrustedForm will then perform a case and whitespace insensitive search for the string.' },
  { name: 'trustedform.scan_delimiter', type: 'string', required: false, description: 'Use this parameter to designate a delimiter when wrapping wildcards or template variables; defaults to |.' },

  { name: 'trustedform.verify', type: 'boolean', required: true, description: 'If true, a request to the Verify product will be made'},
  { name: 'trustedform.advertiser_name', type: 'string', required: false, description: 'The name of the legal entity for an advertiser that will be used to determine if they were given consent in a one to one manner. This value will be normalized to be case insensitive, ignore redundant white space and omit non ascii characters. Both \'Acme Inc.\' and \'acme inc\' would result in the same processed value.' }
];

const validate = (vars) => {
  const certError = helpers.validate(vars);
  if (certError) return certError;
  if (!hasTrustedFormProduct(vars)) return 'a TrustedForm product must be selected';
  if (retainEnabled(vars) && !hasRequiredRetainProps(vars)) return 'an email address or phone number is required to use TrustedForm Retain';
  if (insightsEnabled(vars) && !hasAtLeastOneInsightsProp(vars)) return 'no properties selected for TrustedForm Insights';
};

const hasTrustedFormProduct = (vars) => retainEnabled(vars) || insightsEnabled(vars) || verifyEnabled(vars);
const retainEnabled = (vars) => vars.trustedform?.retain?.valueOf();
const insightsEnabled = (vars) => vars.trustedform?.insights?.valueOf();
const verifyEnabled = (vars) => vars.trustedform?.verify?.valueOf();
const hasRequiredRetainProps = (vars) => !!(vars.lead.email || vars.lead.phone_1);
const hasAtLeastOneInsightsProp = (vars) => formatProperties(vars.insights).length > 0 || vars.insights?.page_scan?.valueOf();
const hasVerifyData = (data) => {
  return data.verify?.languages || data.verify?.result?.language_approved || data.verify?.result?.success || data.verify?.result?.one_to_one;
};

const response = (vars, req, res) => {
  if (res.status < 500) {
    try {
      const parsed = JSON.parse(res.body);
      if (res.status === 200) {
        const verify = hasVerifyData(parsed)
          ? pickBy({
              languages: parsed.verify.languages.map(lang => lang.text),
              form_submitted: parsed.verify.result.form_submitted,
              language_approved: parsed.verify.result.language_approved,
              // note that the Verify one_to_one value is handled separately
              success: parsed.verify.result.success,
            }, (v) => !isUndefined(v))
          : undefined;

        const appended = pickBy({
          outcome: parsed.outcome,
          reason: parsed.reason,

          matched_email: parsed.match_lead?.email,
          matched_phone: parsed.match_lead?.phone,
          successful_match: parsed.match_lead?.result?.success,
          email_fingerprint_matched: parsed.match_lead?.result?.email_match,
          phone_fingerprint_matched: parsed.match_lead?.result?.phone_match,

          reference_code: parsed.retain?.reference,
          vendor: parsed.retain?.vendor,
          previously_retained: parsed.retain?.results?.previously_retained,
          masked_cert_url: parsed.retain?.results?.masked_cert_url,
          share_url: parsed.retain?.results?.share_url,
          expires_at: parsed.retain?.results?.expires_at || parsed.insights?.properties?.expires_at,

          scans_result: parsed.insights?.scans?.result?.success,
          required_scans_found: parsed.insights?.scans?.result?.required?.found,
          required_scans_not_found: parsed.insights?.scans?.result?.required?.not_found,
          forbidden_scans_found: parsed.insights?.scans?.result?.forbidden?.found,
          forbidden_scans_not_found: parsed.insights?.scans?.result?.forbidden?.not_found,
          age_in_seconds: parsed.insights?.properties?.age_seconds,
          city: parsed.insights?.properties?.approx_ip_geo?.city,
          country_code: parsed.insights?.properties?.approx_ip_geo?.country_code,
          latitude: parsed.insights?.properties?.approx_ip_geo?.lat,
          longitude: parsed.insights?.properties?.approx_ip_geo?.lon,
          postal_code: parsed.insights?.properties?.approx_ip_geo?.postal_code,
          state: parsed.insights?.properties?.approx_ip_geo?.state,
          time_zone: parsed.insights?.properties?.approx_ip_geo?.time_zone,
          browser_full: parsed.insights?.properties?.browser?.full,
          user_agent: parsed.insights?.properties?.browser?.user_agent,
          created_at: parsed.insights?.properties?.created_at,
          domain: parsed.insights?.properties?.domain,
          time_on_page_in_seconds: parsed.insights?.properties?.seconds_on_page,
          kpm: parsed.insights?.properties?.form_input_kpm,
          form_input_method: parsed.insights?.properties?.form_input_method,
          wpm: parsed.insights?.properties?.form_input_wpm,
          ip: parsed.insights?.properties?.ip,
          is_framed: parsed.insights?.properties?.is_framed,
          is_masked: parsed.insights?.properties?.is_masked,
          sensitive_hidden_content_elements: parsed.insights?.properties?.num_sensitive_content_elements,
          sensitive_hidden_form_elements: parsed.insights?.properties?.num_sensitive_form_elements,
          os_full: parsed.insights?.properties?.os?.full,
          is_mobile: parsed.insights?.properties?.os?.is_mobile,
          os_name: parsed.insights?.properties?.os?.name,
          page_url: parsed.insights?.properties?.page_url,
          parent_page_url: parsed.insights?.properties?.parent_page_url,
          one_to_one: parsed.verify?.result?.one_to_one,
          verify
        }, (v) => { return !isUndefined(v); });
        // only include this property if page scan was selected
        if (vars.insights?.page_scan?.valueOf()) {
          appended.amount_required_matched = helpers.countRequiredMatched(parsed.insights?.scans?.required, parsed.insights?.scans?.result?.required?.found);
          appended.amount_forbidden_matched = helpers.countRequiredMatched(parsed.insights?.scans?.forbidden, parsed.insights?.scans?.result?.forbidden?.found);
        }
        return appended;
      } else {
        return {
          outcome: parsed.outcome,
          reason: parsed.reason
        };
      }
    } catch (e) {
      return {
        outcome: 'error',
        reason: 'unable to parse response'
      };
    }
  } else {
    return {
      outcome: 'error',
      reason: 'unable to parse response'
    };
  }
};

response.variables = () => [
  { name: 'outcome', type: 'string', description: 'The outcome of the request. Indicates whether the call succeeded, failed, or resulted in an error. The value of the outcome is determined by the result of each operation specified by the caller. "success" is returned if all results resulted in success. "failure" is returned if any result is unsuccessful. If an error occurs during any operation, the outcome is an "error".' },
  { name: 'reason', type: 'string', description: 'Provides an explanation for failure or error.' },
  { name: 'matched_email', type: 'string', description: 'The email or hashed value provided in the request, believed to be that of the consumer recorded in the certificate.' },
  { name: 'matched_phone', type: 'string', description: 'The phone number or hashed value provided in the request, believed to be that of the consumer recorded in the certificate.' },
  { name: 'successful_match', type: 'boolean', description: 'A boolean indicating if any matches were found during the lead matching operation. A null value indicates that lead matching was not performed.' },
  { name: 'email_fingerprint_matched', type: 'boolean', description: 'A boolean indicating if any email matches were found during the lead matching operation. A null value indicates that no emails were provided.' },
  { name: 'phone_fingerprint_matched', type: 'boolean', description: 'A boolean indicating if any phone matches were found during the lead matching operation. A null value indicates that no phone numbers were provided.' },
  { name: 'reference_code', type: 'string', description: 'The parameter provided in the request, intended to be a reference to help you identify the lead associated with the certificate.' },
  { name: 'vendor', type: 'string', description: 'The parameter provided in the request, intended to be the name of the company that provided the lead associated with the certificate.' },
  { name: 'previously_retained', type: 'boolean', description: 'A boolean indicating whether your account had already retained this certificate.' },
  { name: 'expires_at', type: 'time', description: 'The UTC ISO8601 formatted date and time when this certificate will no longer be available for API requests.' },
  { name: 'masked_cert_url', type: 'url', description: 'The certificate url that masks the lead source url and snapshot' },
  { name: 'share_url', type: 'url', description: 'The expiring share URL of the certificate' },
  { name: 'scans_result', type: 'boolean', description: 'A boolean indicating if all required text was found and none of the forbidden text was found.' },
  { name: 'required_scans_found', type: 'array', description: 'A list of required scan terms that were found in the recorded content.' },
  { name: 'required_scans_not_found', type: 'array', description: 'A list of required scan terms that were not found in the recorded content.' },
  { name: 'forbidden_scans_found', type: 'array', description: 'A list of forbidden scan terms that were found in the recorded content.' },
  { name: 'forbidden_scans_not_found', type: 'array', description: 'A list of forbidden scan terms that were not found in the recorded content.' },
  { name: 'amount_required_matched', type: 'string', description: 'How many of the required strings were matched? (all, some, none)' },
  { name: 'amount_forbidden_matched', type: 'string', description: 'How many of the forbidden strings were scanned? (all, some, none)' },
  { name: 'age_in_seconds', type: 'number', description: 'Number of seconds since the last user interaction with the certificate.' },
  { name: 'city', type: 'string', description: 'City name based on consumer\'s public IP address' },
  { name: 'country_code', type: 'string', description: 'Country code based on consumer\'s public IP address' },
  { name: 'latitude', type: 'number', description: 'Latitude based on consumer\'s public IP address' },
  { name: 'longitude', type: 'number', description: 'Longitude based on consumer\'s public IP address' },
  { name: 'postal_code', type: 'postal_code', description: 'Mailing address postal code based on consumer\'s public IP address' },
  { name: 'state', type: 'state', description: 'State/Province or Political Subdivision abbreviation based on consumer\'s public IP address' },
  { name: 'time_zone', type: 'string', description: 'Timezone name based on consumer\'s public IP address' },
  { name: 'browser_full', type: 'string', description: 'A human-friendly version of the browser parsed from the user-agent' },
  { name: 'user_agent', type: 'string', description: 'The consumer\'s browser user-agent' },
  { name: 'created_at', type: 'time', description: 'The UTC ISO8601 formatted date and time when the TrustedForm script was loaded' },
  { name: 'domain', type: 'string', description: 'The domain displayed to the consumer during the page visit' },
  { name: 'time_on_page_in_seconds', type: 'number', description: 'The time in seconds between when the script was loaded and when the most recent event was received' },
  { name: 'kpm', type: 'number', description: 'The average number of keystrokes per minute based on the consumer’s rate of form input.' },
  { name: 'form_input_method', type: 'array', description: 'The detected input method(s) the consumer used to fill out the form, such as "autofill" if the form was filled out using browser autofill; "paste" if the form was filled out pasting text; and "typing" if the form was filled out by typing.' },
  { name: 'wpm', type: 'number', description: 'The approximate number of words per minute calculated by using the form_input_kpm and assuming five characters represent a word.' },
  { name: 'ip', type: 'string', description: 'The consumer\'s public IP address' },
  { name: 'is_framed', type: 'boolean', description: 'A boolean indicating if the form was displayed within an iframe' },
  { name: 'is_masked', type: 'boolean', description: 'A boolean indicating if the certificate is masked and does not show source information nor a session replay' },
  { name: 'sensitive_hidden_content_elements', type: 'number', description: 'Count of how many content elements (e.g. img, div) are marked sensitive and hidden from the session replay' },
  { name: 'sensitive_hidden_form_elements', type: 'number', description: 'Count of how many form elements (e.g. input, textarea) are marked sensitive and hidden from the session replay' },
  { name: 'os_full', type: 'string', description: 'A human-friendly version of the operating system information parsed from the user-agent' },
  { name: 'is_mobile', type: 'boolean', description: 'A boolean indicating that the form was filled out on a mobile device or tablet, based on user-agent' },
  { name: 'os_name', type: 'string', description: 'Operating system name' },
  { name: 'page_url', type: 'string', description: 'The URL of the page hosting TrustedForm Certify.' },
  { name: 'parent_page_url', type: 'string', description: 'The parent URL of the page hosting TrustedForm Certify, if framed.' },
  { name: 'one_to_one', type: 'boolean', description: 'A boolean indicating if the cert structure satisfied the requirements for 1:1 consent.' },
  { name: 'verify.languages', type: 'array', description: 'A list of the consent languages detected within the certificate' },
  { name: 'verify.language_approved', type: 'boolean', description: 'A boolean indicating if any of the consent languages found have been approved in your account\'s consent language manager.' },
  { name: 'verify.form_submitted', type: 'boolean', description: 'A boolean indicating whether the form was successfully submitted by the consumer.' },
  { name: 'verify.success', type: 'boolean', description: 'A boolean indicating if any of the consent languages found meet the success criteria defined for your account.' },
];

module.exports = {
  request,
  response,
  validate
};
