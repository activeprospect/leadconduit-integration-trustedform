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

  if vars.scanAbsence?
    vars.scanAbsence = [ vars.scanAbsence ] unless vars.scanAbsence instanceof Array
    params.push "scan!=#{encodeURIComponent scan}" for scan in vars.scanAbsence

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
  url:     "#{baseUrl}/#{vars.claimId}#{paramString(vars)}",
  method:  'POST',
  headers:
    Accepts:       'application/json',
    Authorization: encodeAuthentication vars.apiKey

request.variables = ->
  [
    { name: 'apiKey', type: 'string', required: true, description: 'TrustedForm API Key' },
    { name: 'claimId', type: 'string', required: true, description: 'Claim ID' }
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
  ]

#
# Exports ----------------------------------------------------------------
#

module.exports =
  request:  request,
  response: response
