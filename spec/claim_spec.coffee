assert = require('chai').assert
integration = require('../src/claim')

describe 'Claim Request', ->
  request = null
  claimId = '533c80270218239ec3000012'
  apiKey  = 'c9351ff49a8e38a23493c6b7328c7629'

  beforeEach ->
    request = integration.request(claimId: claimId, apiKey: apiKey)

  it 'uses the claim id in the url', ->
    assert.equal "https://cert.trustedform.com/#{claimId}", request.url

  it 'uses the apiKey in the auth header', ->
    assert.equal 'Basic QVBJOmM5MzUxZmY0OWE4ZTM4YTIzNDkzYzZiNzMyOGM3NjI5', request.headers.Authorization

  it 'is a POST request type', ->
    assert.equal 'POST', request.method

  it 'accepts JSON', ->
    assert.equal 'application/json', request.headers.Accepts

# {
#     "cert": {
#         "browser": "Chrome 33.0.1750",
#         "claims": [
#             {
#                 "created_at": "2014-04-02T21:24:55Z",
#                 "expires_at": "2019-04-01T21:24:55Z",
#                 "fingerprints": {
#                     "matching": [],
#                     "non_matching": []
#                 },
#                 "id": "533c80270218239ec3000012",
#                 "page_id": "533c76bd0218239ec3000007",
#                 "reference": null,
#                 "scans": null,
#                 "vendor": null,
#                 "warnings": []
#             }
#         ],
#         "created_at": "2014-04-02T21:24:22Z",
#         "expires_at": "2014-04-05T21:24:22Z",
#         "framed": false,
#         "geo": {
#             "city": "Austin",
#             "country_code": "US",
#             "lat": 30.2966,
#             "lon": -97.7663,
#             "postal_code": "78703",
#             "state": "TX",
#             "time_zone": "America/Chicago"
#         },
#         "ip": "127.0.0.1",
#         "location": "http://localhost:81/leadconduit_iframe.html",
#         "operating_system": "Mac OS X 10.9.2",
#         "parent_location": null,
#         "snapshot_url": "http://snapshots.trustedform.dev/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html",
#         "token": "0dcf20941b6b4f196331ff7ae1ca534befa269dd",
#         "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36"
#     },
#     "created_at": "2014-04-02T21:24:55Z",
#     "expires_at": "2019-04-01T21:24:55Z",
#     "fingerprints": {
#         "matching": [],
#         "non_matching": []
#     },
#     "id": "533c80270218239ec3000012",
#     "page_id": "533c76bd0218239ec3000007",
#     "reference": null,
#     "scans": null,
#     "vendor": null,
#     "warnings": []
# }
