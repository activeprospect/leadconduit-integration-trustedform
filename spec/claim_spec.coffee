assert      = require('chai').assert
integration = require('../src/claim')
tk          = require('timekeeper')

describe 'Claim Request', ->
  request     = null
  fullRequest = null
  apiKey      = 'c9351ff49a8e38a23493c6b7328c7629'
  trustedform_cert_url = 'https://cert.trustedform.com/533c80270218239ec3000012'

  baseRequest = (extraKeys) ->
    hash =
      trustedform:
        api_key:  apiKey
      #claim_id: claimId
      lead:
        id: 'lead_id_123',
        trustedform_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012'
      source:
        name: 'Foo, Inc.'

    for key, value of extraKeys
      hash[key] = value

    hash

  beforeEach ->
    request = integration.request fullRequest

  context 'without parameters', ->
    before ->
      fullRequest = baseRequest()

    it 'uses the claim id in the url', ->
      assert.equal request.url, trustedform_cert_url

    it 'uses the api_key in the auth header', ->
      assert.equal request.headers.Authorization, 'Basic QVBJOmM5MzUxZmY0OWE4ZTM4YTIzNDkzYzZiNzMyOGM3NjI5'

    it 'is a POST request type', ->
      assert.equal request.method, 'POST'

    it 'accepts JSON', ->
      assert.equal request.headers.Accept, 'application/json'

    it 'has a form-urlencoded content-type', ->
      assert.equal request.headers['Content-Type'], 'application/x-www-form-urlencoded'

    it 'includes the reference in the URL', ->
      assert.include request.body, "reference=lead_id_123"

    it 'includes the vendor in the URL', ->
      assert.include request.body, "vendor=Foo%2C%20Inc."

  context 'with a scan parameter', ->
    scan = 'string'

    before ->
      fullRequest = baseRequest trustedform:
                                  scan: scan

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan=#{scan}"

  context 'with multiple scan parameters', ->
    first = 'first'
    last  = 'last'

    before ->
      fullRequest = baseRequest trustedform:
                                  scan: [ first, last ]

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan=#{first}&scan=#{last}"

  context 'with a scan_absence parameter', ->
    scan = 'string'

    before ->
      fullRequest = baseRequest trustedform:
                                  scan_absence: scan

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan_absence=#{scan}"

  context 'with multiple scan_absence parameters', ->
    first = 'first'
    last  = 'last'

    before ->
      fullRequest = baseRequest trustedform:
                                  scan_absence: [ first, last ]

    it 'includes the parameters in the URL', ->
      assert.include request.body, "scan_absence=#{first}&scan_absence=#{last}"

  context 'with multiple parameters', ->
    scan         = 'fooscan'
    scan_absence = 'barscan'

    before ->
      fullRequest = baseRequest trustedform:
                                  scan: scan, scan_absence: scan_absence

    it 'includes the parameters in the URL', ->
      assert.include request.body, "scan=#{scan}&scan_absence=#{scan_absence}"

  context 'with a lead email', ->
    email = 'TomJones@vegas.com'

    before ->
      fullRequest = baseRequest lead:
                                  email: email

    it 'includes the parameters in the URL', ->
      assert.include request.body, "email=#{encodeURIComponent email}"

  context 'with a lead phone_1', ->
    phone = '512-789-1111'

    before ->
      fullRequest = baseRequest lead:
                                  phone_1: phone

    it 'includes the parameters in the URL', ->
      assert.include request.body, "phone_1=#{phone}"

  context 'with a lead phone_2', ->
    phone = '512.555.5785'

    before ->
      fullRequest = baseRequest lead:
                                  phone_2: phone

    it 'includes the parameters in the URL', ->
      assert.include request.body, "phone_2=#{phone}"

  context 'without a lead phone_3', ->
    phone = null

    before ->
      fullRequest = baseRequest lead:
                                  phone_3: phone

    it 'doesnt include the parameters in the URL', ->
      assert.notInclude request.body, 'phone_3'

describe 'Claim Response', ->
  vars = {}
  req  = {}

  context 'a successful response', ->
    location         = null
    parentLocation   = null
    expectedLocation = null
    expected         = null
    response         = null

    beforeEach ->
      tk.freeze new Date 1396646152539

      res =
        status: 201,
        headers:
          'Content-Type': 'application/json'
        body: """
              {
                "cert": {
                  "browser": "Chrome 33.0.1750",
                  "claims": [
                    {
                      "created_at": "2014-04-02T21:24:55Z",
                      "expires_at": "2019-04-01T21:24:55Z",
                      "fingerprints": {
                        "matching": [],
                        "non_matching": []
                      },
                      "id": "533c80270218239ec3000012",
                      "page_id": "533c76bd0218239ec3000007",
                      "reference": null,
                      "scans": null,
                      "vendor": null,
                      "warnings": []
                    }
                  ],
                  "created_at": "2014-04-02T21:24:22Z",
                  "expires_at": "2014-04-05T21:24:22Z",
                  "framed": false,
                  "geo": {
                    "city": "Austin",
                    "country_code": "US",
                    "lat": 30.2966,
                    "lon": -97.7663,
                    "postal_code": "78703",
                    "state": "TX",
                    "time_zone": "America/Chicago"
                  },
                  "ip": "127.0.0.1",
                  "location": #{location},
                  "operating_system": "Mac OS X 10.9.2",
                  "parent_location": #{parentLocation},
                  "snapshot_url": "http://snapshots.trustedform.dev/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html",
                  "token": "0dcf20941b6b4f196331ff7ae1ca534befa269dd",
                  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36"
                },
                "created_at": "2014-04-02T21:24:55Z",
                "expires_at": "2019-04-01T21:24:55Z",
                "fingerprints": {
                  "matching": [],
                  "non_matching": []
                },
                "id": "533c80270218239ec3000012",
                "page_id": "533c76bd0218239ec3000007",
                "reference": null,
                "scans": null,
                "vendor": null,
                "warnings": []
              }
              """

      expected =
        outcome: 'success'
        reason: null
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36"
        browser: "Chrome 33.0.1750"
        os: "Mac OS X 10.9.2"
        ip: "127.0.0.1"
        geo:
          city: "Austin"
          country_code: "US"
          lat: 30.2966
          lon: -97.7663
          postal_code: "78703"
          state: "TX"
          time_zone: "America/Chicago"
        snapshot_url: "http://snapshots.trustedform.dev/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html"
        url: expectedLocation
        domain: "localhost"
        age_in_seconds: 172290
        created_at: "2014-04-02T21:24:22Z"

      response = integration.response vars, req, res

    afterEach ->
      tk.reset()

    context 'without a parent location', ->
      before ->
        expectedLocation = 'http://localhost:81/leadconduit_iframe.html'
        parentLocation   = null
        location         = """
                           "#{expectedLocation}"
                           """

      it 'uses the location in the response', ->
        assert.deepEqual response, expected

    context 'with a parent location', ->
      host = 'yourhost'

      before ->
        expectedLocation = "http://#{host}:81/my_iframe.html"
        location         = null
        parentLocation   = """
                           "#{expectedLocation}"
                           """

      it 'uses the parent location in the response', ->
        expected.url    = expectedLocation
        expected.domain = host

        assert.deepEqual response, expected

  it 'returns an error when cert not found', ->
    res  =
      status: 404
      headers:
        'Content-Type': 'application/json'
      body: """
            {
              "message": "certificate not found"
            }
            """
    expected =
      outcome: 'error'
      reason:  'TrustedForm error - certificate not found (404)'
    response = integration.response(vars, req, res)
    assert.deepEqual response, expected


  it 'returns an error when unauthorized', ->
    res =
      status: 401
      headers:
        'Content-Type': 'application/json'
      body: null

    expected =
      outcome: 'error'
      reason: 'TrustedForm error - undefined (401)'

    response = integration.response(vars, req, res)
    assert.deepEqual expected, response
