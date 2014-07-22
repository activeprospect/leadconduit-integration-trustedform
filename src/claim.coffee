querystring = require 'querystring'
url         = require 'url'

content = (vars) ->
  params = {
    reference: vars.lead.id
    vendor: vars.source.name
  }

  if vars.trustedform.scan?
    vars.trustedform.scan   = [ vars.trustedform.scan ] unless vars.trustedform.scan instanceof Array
    params.scan = vars.trustedform.scan

  if vars.trustedform.scan_absence?
    vars.trustedform.scan_absence   = [ vars.trustedform.scan_absence ] unless vars.trustedform.scan_absence instanceof Array
    params.scan_absence = vars.trustedform.scan_absence

  params.email   = vars.lead.email   if vars.lead.email?
  params.phone_1 = vars.lead.phone_1 if vars.lead.phone_1?
  params.phone_2 = vars.lead.phone_2 if vars.lead.phone_2?
  params.phone_3 = vars.lead.phone_3 if vars.lead.phone_3?

  querystring.encode params

encodeAuthentication = (apiKey) ->
  'Basic ' + new Buffer("API:#{apiKey}").toString('base64')

#
# Request Function -------------------------------------------------------
#

request = (vars) ->
  url:     vars.trustedform.cert_url,
  method:  'POST',
  headers:
    Accept:        'application/json',
    Authorization:  encodeAuthentication vars.trustedform.api_key
    'Content-Type': 'application/x-www-form-urlencoded'
  body: content vars

request.variables = ->
  [
    { name: 'trustedform.cert_url', type: 'string', required: true, description: 'TrustedForm Certificate URL' },
    { name: 'trustedform.api_key', type: 'string', required: true, description: 'TrustedForm API Key' },
    { name: 'trustedform.scan', type: 'string', required: false, description: 'Required text in snapshot' },
    { name: 'trustedform.scan_absence', type: 'string', required: false, description: 'Forbidden text in snapshot' },
    { name: 'lead.email', type: 'string', required: false, description: 'Lead email that will be fingerprinted' },
    { name: 'lead.phone_1', type: 'string', required: false, description: 'Lead phone 1 that will be fingerprinted' },
    { name: 'lead.phone_2', type: 'string', required: false, description: 'Lead phone 2 that will be fingerprinted' },
    { name: 'lead.phone_3', type: 'string', required: false, description: 'Lead phone 3 that will be fingerprinted' },
  ]

#
# Response Function ------------------------------------------------------
#

ageInSeconds = (date) ->
  difference = Date.now() - new Date(date)
  Math.floor difference / 1000

response = (vars, req, res) ->
  event = JSON.parse(res.body)

  if res.status == 201 && event?.cert?
    hosted_url = event.cert.parent_location ? event.cert.location

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
    url: hosted_url
    domain: url.parse(hosted_url).hostname if hosted_url?
    age_in_seconds: ageInSeconds event.cert.created_at
    created_at: event.cert.created_at
  else
    outcome: 'error'
    reason:  "TrustedForm error - #{event?.message} (#{res.status})"

response.variables = ->
  [
    { name: 'outcome', type: 'string', description: 'certificate claim result' }
    { name: 'reason', type: 'string', description: 'in case of failure, the reason for failure' }
    { name: 'user_agent', type: 'string', required: 'true', description: 'Consumer browsers user-agent' }
    { name: 'browser', type: 'string', required: 'true', description: 'Human friendly version of user-agent' }
    { name: 'os', type: 'string', required: 'true', description: 'Human friendly version of the users operating system' }
    { name: 'ip', type: 'string', required: 'true', description: 'Consumers IP address' }
    { name: 'location.city', type: 'string', required: 'true', description: 'City name' }
    { name: 'location.country_code', type: 'string', required: 'true', description: 'Country code' }
    { name: 'location.latitude', type: 'number', required: 'true', description: 'Latitude' }
    { name: 'location.longitude', type: 'number', required: 'true', description: 'Longitude' }
    { name: 'location.postal_code', type: 'string', required: 'true', description: 'Mailing address postal code' }
    { name: 'location.state', type: 'string', required: 'true', description: 'State or province name' }
    { name: 'location.time_zone', type: 'string', required: 'true', description: 'Time zone name' }
    { name: 'snapshot_url', type: 'string', required: 'true', description: 'URL of the snapshot of the offer page as seen by the user' }
    { name: 'url', type: 'string', required: 'true', description: 'Parent frames URL if the page is framed, or location of the page hosting the javascript' }
    { name: 'domain', type: 'string', required: 'true', description: 'Domain of the url' }
    { name: 'age_in_seconds', type: 'number', required: 'true', description: 'Number of seconds since the certificate was created' }
    { name: 'created_at', type: 'time', required: 'true', description: 'Time the user loaded the form in UTC ISO8601 format' }
  ]

#
# Exports ----------------------------------------------------------------
#

module.exports =
  request:  request,
  response: response
