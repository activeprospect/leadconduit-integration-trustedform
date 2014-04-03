baseUrl = 'https://cert.trustedform.com'

#
# Request Function -------------------------------------------------------
#

request = (vars) ->
  {
    url:     "#{baseUrl}/#{vars.claimId}",
    method:  'POST',
    headers: {
      # TODO: verify that we won't communicate via x-www-form-urlencoded
      Accepts:       'application/json',
      Authorization: encodeAuthentication vars.apiKey
    }
  }

request.variables = ->
  [
    { name: 'apiKey', type: 'string', required: true, description: 'TrustedForm API Key' },
    { name: 'claimId', type: 'string', required: true, description: 'Claim ID' }
  ]

encodeAuthentication = (apiKey) ->
  'Basic ' + new Buffer('API' + ':' + apiKey).toString('base64')

#
# Response Function ------------------------------------------------------
#

response = (vars, req, res) ->
  event = JSON.parse(res.body)

  if res.status == 200
    event['outcome'] = 'success'
    event
  else
    { outcome: 'error', reason: "TrustedForm error - #{event.message} (#{res.status})" }

#
# Exports ----------------------------------------------------------------
#

module.exports =
  request:  request,
  response: response
