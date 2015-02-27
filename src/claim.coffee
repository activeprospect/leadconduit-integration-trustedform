querystring = require 'querystring'
url         = require 'url'

content = (vars) ->
  params = {
    reference: vars.lead.id
    vendor: vars.source.name
  }

  if vars.trustedform?.scan_required_text?
    vars.trustedform.scan_required_text = [ vars.trustedform.scan_required_text ] unless vars.trustedform.scan_required_text instanceof Array
    params.scan = vars.trustedform.scan_required_text

  if vars.trustedform?.scan_forbidden_text?
    vars.trustedform.scan_forbidden_text = [ vars.trustedform.scan_forbidden_text ] unless vars.trustedform.scan_forbidden_text instanceof Array
    params['scan!'] = vars.trustedform.scan_forbidden_text

  params.email   = vars.lead.email.toString()   if vars.lead.email?
  params.phone_1 = vars.lead.phone_1.toString() if vars.lead.phone_1?
  params.phone_2 = vars.lead.phone_2.toString() if vars.lead.phone_2?
  params.phone_3 = vars.lead.phone_3.toString() if vars.lead.phone_3?

  querystring.encode params

encodeAuthentication = (apiKey) ->
  'Basic ' + new Buffer("API:#{apiKey}").toString('base64')

#
# Request Function -------------------------------------------------------
#

request = (vars) ->
  url:     vars.lead.trustedform_cert_url,
  method:  'POST',
  headers:
    Accept:        'application/json',
    Authorization:  encodeAuthentication vars.activeprospect.api_key
    'Content-Type': 'application/x-www-form-urlencoded'
  body: content vars

request.variables = ->
  [
    { name: 'lead.trustedform_cert_url', type: 'string', required: true, description: 'TrustedForm Certificate URL' },
    { name: 'trustedform.scan_required_text', type: 'string', required: false, description: 'Required text to search snapshot for' },
    { name: 'trustedform.scan_forbidden_text', type: 'string', required: false, description: 'Forbidden text to search snapshot for' },
    { name: 'lead.email', type: 'string', required: false, description: 'Lead email that will be fingerprinted' },
    { name: 'lead.phone_1', type: 'string', required: false, description: 'Lead phone 1 that will be fingerprinted' },
    { name: 'lead.phone_2', type: 'string', required: false, description: 'Lead phone 2 that will be fingerprinted' },
    { name: 'lead.phone_3', type: 'string', required: false, description: 'Lead phone 3 that will be fingerprinted' },
  ]

#
# Validate Function ------------------------------------------------------
#
validate = (vars) ->
  return 'TrustedForm cert URL must not be blank' unless vars.lead.trustedform_cert_url
  # https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985
  tfRegex = /https:\/\/cert.trustedform.com\/[a-h0-9]{40}/
  return 'TrustedForm cert URL must be valid' unless tfRegex.test(vars.lead.trustedform_cert_url)


#
# Response Function ------------------------------------------------------
#

ageInSeconds = (claim) ->
  difference = Date.now() - new Date(claim.cert.created_at)
  difference += parseInt(claim.event_duration) if claim.event_duration? and not isNaN(claim.event_duration)
  Math.round difference / 1000


timeOnPageInSeconds = (event_duration) ->
  return null if !event_duration? or isNaN(event_duration)
  Math.round parseInt(event_duration) / 1000


formatScanReason = (scannedFor, textArray) ->
  matches = textArray.filter (t) ->
    scannedFor.indexOf(t) >= 0
  # sort text items for uniformity of reason across leads, and (arbitrary) limit in case of long scan text
  "#{matches.length}: '#{matches.sort().join(', ').substr(0, 255)}'"


response = (vars, req, res) ->
  event = JSON.parse(res.body)

  if res.status == 201 && event?.cert?
    hosted_url = event.cert.parent_location ? event.cert.location

    appended =
      outcome: 'success'
      reason: null
      user_agent: event.cert.user_agent
      browser: event.cert.browser
      os: event.cert.operating_system
      ip: event.cert.ip
      location:
        city: event.cert.geo.city
        country_code: event.cert.geo.country_code
        latitude: event.cert.geo.lat
        longitude: event.cert.geo.lon
        postal_code: event.cert.geo.postal_code
        state: event.cert.geo.state
        time_zone: event.cert.geo.time_zone
      snapshot_url: event.cert.snapshot_url
      masked_cert_url: event.masked_cert_url
      is_masked: event.masked
      url: hosted_url
      domain: url.parse(hosted_url).hostname if hosted_url?
      age_in_seconds: ageInSeconds event
      time_on_page_in_seconds: timeOnPageInSeconds event.event_duration
      created_at: event.cert.created_at
      scans:
        found: event.scans?.found || []
        not_found: event.scans?.not_found || []

    if event.warnings?
      if event.warnings.some((warning) -> warning == 'string not found in snapshot')
        appended.outcome = 'failure'
        appended.reason  = "Required scan text not found in TrustedForm snapshot (missing #{formatScanReason(vars.trustedform.scan_required_text, event.scans.not_found)})"

      if event.warnings.some((warning) -> warning == 'string found in snapshot')
        appended.outcome = 'failure'
        appended.reason  = if appended.reason? then "#{appended.reason}; " else ""
        appended.reason += "Forbidden scan text found in TrustedForm snapshot (found #{formatScanReason(vars.trustedform.scan_forbidden_text, event.scans.found)})"

  else
    appended =
      outcome: 'error'
      reason:  "TrustedForm error - #{event?.message} (#{res.status})"

  return appended


response.variables = ->
  [
    { name: 'outcome', type: 'string', description: 'certificate claim result' }
    { name: 'reason', type: 'string', description: 'in case of failure, the reason for failure' }
    { name: 'user_agent', type: 'string', description: 'Consumer browsers user-agent' }
    { name: 'browser', type: 'string', description: 'Human friendly version of user-agent' }
    { name: 'os', type: 'string', description: 'Human friendly version of the users operating system' }
    { name: 'ip', type: 'string', description: 'Consumers IP address' }
    { name: 'location.city', type: 'string', description: 'City name' }
    { name: 'location.country_code', type: 'string', description: 'Country code' }
    { name: 'location.latitude', type: 'number', description: 'Latitude' }
    { name: 'location.longitude', type: 'number', description: 'Longitude' }
    { name: 'location.postal_code', type: 'string', description: 'Mailing address postal code' }
    { name: 'location.state', type: 'string', description: 'State or province name' }
    { name: 'location.time_zone', type: 'string', description: 'Time zone name' }
    { name: 'snapshot_url', type: 'string', description: 'URL of the snapshot of the offer page as seen by the user' }
    { name: 'masked_cert_url', type: 'string', description: 'The certificate url that masks the lead source url and snapshot' }
    { name: 'url', type: 'string', description: 'Parent frames URL if the page is framed, or location of the page hosting the javascript' }
    { name: 'domain', type: 'string', description: 'Domain of the url' }
    { name: 'age_in_seconds', type: 'number', description: 'Number of seconds since the certificate was created' }
    { name: 'time_on_page_in_seconds', type: 'number', description: 'Number of seconds the consumer spent filling out the offer form' }
    { name: 'created_at', type: 'time', description: 'Time the user loaded the form in UTC ISO8601 format' }
    { name: 'is_masked', type: 'boolean', description: 'Whether the cert being claimed is masked'}
    { name: 'scans.found', type: 'array', description: 'Forbidden scan terms found in the claim'}
    { name: 'scans.not_found', type: 'array', description: 'Required scan terms not found in the claim'}
  ]

#
# Exports ----------------------------------------------------------------
#

module.exports =
  validate: validate,
  request:  request,
  response: response
