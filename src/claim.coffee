baseUrl = 'https://cert.trustedform.com'

paramString = (vars) ->
  string = ''
  params = []

  if vars.reference?
    params.push "reference=#{encodeURIComponent vars.reference}"

  if vars.vendor?
    params.push "vendor=#{encodeURIComponent vars.vendor}"

  if vars.scan?
    vars.scan = [ vars.scan ] unless vars.scan instanceof Array
    params.push "scan=#{encodeURIComponent scan}" for scan in vars.scan

  if vars.scan_absence?
    vars.scan_absence = [ vars.scan_absence ] unless vars.scan_absence instanceof Array
    params.push "scan!=#{encodeURIComponent scan}" for scan in vars.scan_absence

  if vars.fingerprint?
    vars.fingerprint = [ vars.fingerprint ] unless vars.fingerprint instanceof Array
    params.push "fingerprint=#{fingerprint}" for fingerprint in vars.fingerprint

  if params.length
    string = "?#{params.join '&'}"

  string

encodeAuthentication = (apiKey) ->
  'Basic ' + new Buffer("API:#{apiKey}").toString('base64')

#
# Request Function -------------------------------------------------------
#

request = (vars) ->
  url:     "#{baseUrl}/#{vars.claim_id}#{paramString(vars)}",
  method:  'POST',
  headers:
    Accepts:       'application/json',
    Authorization: encodeAuthentication vars.api_key

request.variables = ->
  [
    { name: 'api_key', type: 'string', required: true, description: 'TrustedForm API Key' },
    { name: 'claim_id', type: 'string', required: true, description: 'Claim ID' },
    { name: 'reference', type: 'string', required: false, description: 'Lead Identifier' },
    { name: 'vendor', type: 'string', required: false, description: 'Vendor Identifier' },
    { name: 'scan', type: 'string', required: false, description: 'Required text in snapshot' },
    { name: 'scan_absence', type: 'string', required: false, description: 'Forbidden text in snapshot' },
    { name: 'fingerprint', type: 'string', required: false, description: 'Lead fingerprint information' }
  ]

#
# Response Function ------------------------------------------------------
#

response = (vars, req, res) ->
  event = JSON.parse(res.body)

  if res.status == 201
    event['outcome'] = 'success'
    event
  else
    { outcome: 'error', reason: "TrustedForm error - #{event.message} (#{res.status})" }

response.variables = ->
  [
    { name: 'cert.browser', type: 'string', required: 'true', description: 'Human friendly version of user-agent' },
    { name: 'cert.claims.created_at', type: 'string', required: 'true', description: 'Time the claim was created in UTC ISO8601 format' },
    { name: 'cert.claims.expires_at', type: 'string', required: 'true', description: 'Time the claim will expire in UTC ISO8601 format' },
    { name: 'cert.claims.id', type: 'string', required: 'true', description: 'Claim identifier' },
    { name: 'cert.claims.page_id', type: 'string', required: 'true', description: 'Page identifier' },
    { name: 'cert.claims.reference', type: 'string', required: 'false', description: 'Reference provided when the certificate was claimed' },
    { name: 'cert.claims.scans.found', type: 'string', required: 'false', description: 'Scans that matched a page snapshot' },
    { name: 'cert.claims.scans.not_found', type: 'string', required: 'true', description: 'Scans that didnt match a page snapshot' },
    { name: 'cert.claims.vendor', type: 'string', required: 'false', description: 'Vendor name provided when the certificate was claimed' },
    { name: 'cert.claims.warnings', type: 'string', required: 'false', description: 'Potential problems with the claim or cert' },
    { name: 'cert.claims.fingerprints.matching', type: 'string', required: 'false', description: 'Lead fingerprint that matched a fingerprint collected' },
    { name: 'cert.claims.fingerprints.non_matching', type: 'string', required: 'false', description: 'Lead fingerprint that did not match a fingerprint collected' },
    { name: 'cert.created_at', type: 'string', required: 'true', description: 'Time the user loaded the form in UTC ISO8601 format' },
    { name: 'cert.expires_at', type: 'string', required: 'true', description: 'Time the certificate will expire in UTC ISO8601 format' },
    { name: 'cert.framed', type: 'boolean', required: 'true', description: 'Whether the form is hosted on a framed page' },
    { name: 'cert.geo.city', type: 'string', required: 'true', description: 'City name' },
    { name: 'cert.geo.country_code', type: 'string', required: 'true', description: 'Country code' },
    { name: 'cert.geo.lat', type: 'number', required: 'true', description: 'Latitude' },
    { name: 'cert.geo.lon', type: 'number', required: 'true', description: 'Longitude' },
    { name: 'cert.geo.postal_code', type: 'string', required: 'true', description: 'Mailing address postal code' },
    { name: 'cert.geo.state', type: 'string', required: 'true', description: 'State or province name' },
    { name: 'cert.geo.time_zone', type: 'string', required: 'true', description: 'Time zone name' },
    { name: 'cert.ip', type: 'string', required: 'true', description: 'Consumers IP address' },
    { name: 'cert.location', type: 'string', required: 'true', description: 'Location of the page hosting the javascript' },
    { name: 'cert.operating_system', type: 'string', required: 'true', description: 'Human friendly version of the users operating system' },
    { name: 'cert.parent_location', type: 'string', required: 'false', description: 'Parent frames URL if the page is framed' },
    { name: 'cert.snapshot_url', type: 'string', required: 'true', description: 'URL of the snapshot of the offer page as seen by the user' },
    { name: 'cert.token', type: 'string', required: 'true', description: 'Unique certificate identifier' },
    { name: 'cert.user_agent', type: 'string', required: 'true', description: 'Consumer browsers user-agent' },
    { name: 'created_at', type: 'string', required: 'true', description: 'Time the claim was created in UTC ISO8601 format' },
    { name: 'expires_at', type: 'string', required: 'true', description: 'Time the claim will expire in UTC ISO8601 format' },
    { name: 'fingerprints.matching', type: 'string', required: 'false', description: 'Lead fingerprint that matched a fingerprint collected' },
    { name: 'fingerprints.non_matching', type: 'string', required: 'false', description: 'Lead fingerprint that did not match a fingerprint collected' },
    { name: 'id', type: 'string', required: 'true', description: 'Claim identifier' },
    { name: 'page_id', type: 'string', required: 'true', description: 'Page identifier' },
    { name: 'reference', type: 'string', required: 'false', description: 'Referance provided when the certificate was claimed' },
    { name: 'scans.found', type: 'string', required: 'false', description: 'Scans that matched a page snapshot' },
    { name: 'scans.not_found', type: 'string', required: 'false', description: 'Scans that didnt match a page snapshot' },
    { name: 'vendor', type: 'string', required: 'false', description: 'Vendor name provided when the certificate was claimed' },
    { name: 'warnings', type: 'string', required: 'false', description: 'Potential problems with the claim or cert' },
  ]

#
# Exports ----------------------------------------------------------------
#

module.exports =
  request:  request,
  response: response
