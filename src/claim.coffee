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

  if res.status == 201
    hosted_url = event.cert.parent_location or event.cert.location

    trustedform:
      user_agent: event.cert.user_agent
      browser: event.cert.browser
      os: event.cert.operating_system
      ip: event.cert.ip
      geo:
        city: event.cert.geo.city
        country_code: event.cert.geo.country_code
        lat: event.cert.geo.lat
        lon: event.cert.geo.lon
        postal_code: event.cert.geo.postal_code
        state: event.cert.geo.state
        time_zone: event.cert.geo.time_zone
      snapshot_url: event.cert.snapshot_url
      url: hosted_url
      domain: url.parse(hosted_url).hostname
      age_in_seconds: ageInSeconds event.cert.created_at
      created_at: event.cert.created_at
      reason: null
      outcome: 'success'
  else
    outcome: 'error'
    reason:  "TrustedForm error - #{event.message} (#{res.status})"

response.variables = ->
  [
    { name: 'trustedform.user_agent', type: 'string', required: 'true', description: 'Consumer browsers user-agent' },
    { name: 'trustedform.browser', type: 'string', required: 'true', description: 'Human friendly version of user-agent' },
    { name: 'trustedform.os', type: 'string', required: 'true', description: 'Human friendly version of the users operating system' },
    { name: 'trustedform.ip', type: 'string', required: 'true', description: 'Consumers IP address' },
    { name: 'trustedform.geo.city', type: 'string', required: 'true', description: 'City name' },
    { name: 'trustedform.geo.country_code', type: 'string', required: 'true', description: 'Country code' },
    { name: 'trustedform.geo.lat', type: 'number', required: 'true', description: 'Latitude' },
    { name: 'trustedform.geo.lon', type: 'number', required: 'true', description: 'Longitude' },
    { name: 'trustedform.geo.postal_code', type: 'string', required: 'true', description: 'Mailing address postal code' },
    { name: 'trustedform.geo.state', type: 'string', required: 'true', description: 'State or province name' },
    { name: 'trustedform.geo.time_zone', type: 'string', required: 'true', description: 'Time zone name' },
    { name: 'trustedform.snapshot_url', type: 'string', required: 'true', description: 'URL of the snapshot of the offer page as seen by the user' },
    { name: 'trustedform.url', type: 'string', required: 'true', description: 'Parent frames URL if the page is framed, or location of the page hosting the javascript' },
    { name: 'trustedform.domain', type: 'string', required: 'true', description: 'Domain of the url' },
    { name: 'trustedform.age_in_seconds', type: 'number', required: 'true', description: 'Number of seconds since the certificate was created' },
    { name: 'trustedform.created_at', type: 'time', required: 'true', description: 'Time the user loaded the form in UTC ISO8601 format' },
    { name: 'trustedform.reason', type: 'string', required: 'true', description: 'Will be null for successful responses' },
    { name: 'trustedform.outcome', type: 'string', required: 'true', description: 'Will be success for successful responses' },
  ]

#
# Exports ----------------------------------------------------------------
#

module.exports =
  request:  request,
  response: response
