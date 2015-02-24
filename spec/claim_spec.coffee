assert      = require('chai').assert
integration = require('../src/claim')
tk          = require('timekeeper')
emailtype   = require('leadconduit-types').email
phonetype   = require('leadconduit-types').phone

describe 'Cert URL validate', ->

  it 'should error on undefined cert url', ->
    error = integration.validate(lead: {})
    assert.equal error, 'TrustedForm cert URL must not be blank'

  it 'should error on null cert url', ->
    error = integration.validate(lead: { trustedform_cert_url: null })
    assert.equal error, 'TrustedForm cert URL must not be blank'

  it 'should error on invalid cert url', ->
    error = integration.validate(lead: { trustedform_cert_url: 'http://someothersite.com' })
    assert.equal error, 'TrustedForm cert URL must be valid'

  it 'should not error when cert url is valid', ->
    error = integration.validate(lead: { trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985' })
    assert.isUndefined error


describe 'Claim Request', ->
  request     = null
  fullRequest = null
  apiKey      = 'c9351ff49a8e38a23493c6b7328c7629'
  trustedform_cert_url = 'https://cert.trustedform.com/533c80270218239ec3000012'

  baseRequest = (extraKeys) ->
    hash =
      activeprospect:
        api_key:  apiKey
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
      fullRequest = baseRequest { trustedform: { scan_required_text: scan }}

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan=#{scan}"

  context 'with multiple scan parameters', ->
    first = 'first'
    last  = 'last'

    before ->
      fullRequest = baseRequest { trustedform: { scan_required_text: [ first, last ] }}

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan=#{first}&scan=#{last}"

  context 'with a scan_forbidden_text parameter', ->
    scan = 'string'

    before ->
      fullRequest = baseRequest { trustedform: { scan_forbidden_text: scan }}

    it 'includes the parameter in the URL', ->
      assert.include request.body, "scan!=#{scan}"

  context 'with multiple scan_forbidden_text parameters', ->
    first = 'first'
    last  = 'last'

    before ->
      fullRequest = baseRequest { trustedform: { scan_forbidden_text: [ first, last ] }}

    it 'includes the parameters in the URL', ->
      assert.include request.body, "scan!=#{first}&scan!=#{last}"

  context 'with multiple parameters', ->
    scan          = 'fooscan'
    scanForbidden = 'barscan'

    before ->
      fullRequest = baseRequest { trustedform: { scan_required_text: scan, scan_forbidden_text: scanForbidden }}

    it 'includes the parameters in the URL', ->
      assert.include request.body, "scan=#{scan}&scan!=#{scanForbidden}"

  context 'with a lead email', ->
    email = emailtype.parse('TomJones@vegas.com')

    before ->
      fullRequest = baseRequest { lead: { email: email }}

    it 'includes the parameters in the URL', ->
      assert.include request.body, "email=#{encodeURIComponent email}"

  context 'with a lead phone_1', ->
    phone = phonetype.parse('512-789-1111')

    before ->
      fullRequest = baseRequest { lead: { phone_1: phone }}

    it 'includes the parameters in the URL', ->
      assert.include request.body, "phone_1=#{phone}"

  context 'with a lead phone_2', ->
    phone = phonetype.parse('512.555.5785')

    before ->
      fullRequest = baseRequest { lead: { phone_2: phone }}

    it 'includes the parameters in the URL', ->
      assert.include request.body, "phone_2=#{phone}"

  context 'without a lead phone_3', ->
    phone = null

    before ->
      fullRequest = baseRequest { lead: { phone_3: phone }}

    it 'doesnt include the parameters in the URL', ->
      assert.notInclude request.body, 'phone_3'

describe 'Claim Response', ->

  getResponse = (body, vars = {}) ->
    res =
      status: 201,
      headers:
        'Content-Type': 'application/json'
      body: responseBody(body)

    integration.response(vars, {}, res)


  context 'a successful response', ->

    beforeEach ->
      tk.freeze new Date 1396646152539

    afterEach ->
      tk.reset()

    it 'uses the location when there is no parent location', ->
      url = 'http://localhost:81/leadconduit_iframe.html'
      assert.deepEqual getResponse({location: url}), expected({url: url})


    it 'uses the parent location when it is present', ->
      host = 'yourhost'
      url = "http://#{host}:81/my_iframe.html"

      assert.deepEqual getResponse({parentLocation: url}), expected({url: url, domain: host})


    describe 'scan results parsing', ->

      it 'handles null value for scans', ->
        response = getResponse()
        assert.equal response.scans.found.length, 0

      it 'captures scans_found', ->
        scanText1 = "some disclosure text"
        response = getResponse({scans: { found: [scanText1], not_found: [] } })
        assert.equal response.scans.found.length, 1
        assert.equal response.scans.found[0], scanText1

        scanText2 = "other disclosure text"
        response = getResponse({scans: { found: [scanText1, scanText2], not_found: [] } })
        assert.equal response.scans.found.length, 2
        assert.equal response.scans.found[0], scanText1
        assert.equal response.scans.found[1], scanText2

      it 'captures scans_not_found', ->
        response = getResponse({scans: { found: [], not_found: ["free iPod from Obama!"] } })
        assert.equal response.scans.not_found[0], "free iPod from Obama!"

      it 'sets failure outcome and reason when required scan is missing', ->
        vars = trustedform: scan_required_text: "some disclosure text"
        body = warnings: ["string not found in snapshot"], scans: { found: [], not_found: ["some disclosure text"] }
        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text')"

      it 'correctly formats reason when multiple required scans are missing', ->
        vars = trustedform: scan_required_text: ["some disclosure text", "other disclosure text"]
        body = warnings: ["string not found in snapshot"], scans: { found: [], not_found: ["some disclosure text", "other disclosure text"] }
        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Required scan text not found in TrustedForm snapshot (missing 2: 'other disclosure text, some disclosure text')"

      it 'sets failure outcome and reason when forbidden scan is present', ->
        vars = trustedform: scan_forbidden_text: "free iPod from Obama!"
        body = warnings: ["string found in snapshot"], scans: { found: ["free iPod from Obama!"], not_found: [] }
        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')"

      it 'sets failure outcome and reason when both required scan is missing and forbidden scan is present', ->
        vars =
          trustedform:
            scan_required_text: "some disclosure text"
            scan_forbidden_text: "free iPod from Obama!"
        body =
          warnings: ["string not found in snapshot", "string found in snapshot"],
          scans: { found: ["free iPod from Obama!"], not_found: ["some disclosure text"] }

        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text'); Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')"

      it 'sets correct reason when required and forbidden text are both present', ->
        vars =
          trustedform:
            scan_required_text: "some disclosure text"
            scan_forbidden_text: "free iPod from Obama!"
        body =
          warnings: ["string found in snapshot"],
          scans: { found: ["free iPod from Obama!", "some disclosure text"] }

        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')"

      it 'sets correct reason when neither required or forbidden text are present', ->
        vars =
          trustedform:
            scan_required_text: "some disclosure text"
            scan_forbidden_text: "free iPod from Obama!"
        body =
          warnings: ["string not found in snapshot"],
          scans: { not_found: ["free iPod from Obama!", "some disclosure text"] }

        response = getResponse(body, vars)
        assert.equal response.outcome, "failure"
        assert.equal response.reason, "Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text')"

      it 'sets success outcome when required scan is present and forbidden scan is not', ->
        vars =
          trustedform:
            scan_required_text: "some disclosure text"
            scan_forbidden_text: "free iPod from Obama!"
        body =
          warnings: [],
          scans: { found: ["some disclosure text"] }

        response = getResponse(body, vars)
        assert.equal response.outcome, "success"
        assert.equal response.reason, null

      it 'age in seconds includes event duration when present', ->
        vars = {}
        body = event_duration: 61999
        response = getResponse(body, vars)
        assert.equal response.age_in_seconds, 172353 # 172291s + 61.999s


      it 'time on page included when event duration present', ->
        vars = {}
        body = event_duration: 61999
        response = getResponse(body, vars)
        assert.equal response.time_on_page_in_seconds, 62 # 61.999s rounded


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
    response = integration.response({}, {}, res)
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

    response = integration.response({}, {}, res)
    assert.deepEqual expected, response


responseBody = (vars = {}) ->
  response =
    cert:
      browser: "Chrome 33.0.1750"
      claims: [
        {
          created_at: "2014-04-02T21:24:55Z"
          expires_at: "2019-04-01T21:24:55Z"
          fingerprints:
            matching: []
            non_matching: []
          id: "533c80270218239ec3000012"
          page_id: "533c76bd0218239ec3000007"
          reference: null
          scans: null
          vendor: null
          warnings: []
        }
      ]
      created_at: "2014-04-02T21:24:22Z"
      expires_at: "2014-04-05T21:24:22Z"
      framed: false
      geo:
        city: "Austin"
        country_code: "US"
        lat: 30.2966
        lon: -97.7663
        postal_code: "78703"
        state: "TX"
        time_zone: "America/Chicago"
      ip: "127.0.0.1"
      location: vars.location || null
      operating_system: "Mac OS X 10.9.2"
      parent_location: vars.parentLocation || null
      snapshot_url: "http://snapshots.trustedform.com/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html"
      token: "0dcf20941b6b4f196331ff7ae1ca534befa269dd"
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36"
    created_at: "2014-04-02T21:24:55Z"
    expires_at: "2019-04-01T21:24:55Z"
    fingerprints:
      matching: []
      non_matching: []
    id: "533c80270218239ec3000012"
    page_id: "533c76bd0218239ec3000007"
    masked_cert_url: "https://cert.trustedform.com/e57c02509dda472de4aed9e8950a331fcfda6dc4"
    masked: false
    reference: null
    scans: vars.scans || null
    vendor: null
    warnings: vars.warnings || []

  response.event_duration = vars.event_duration if vars.event_duration?

  JSON.stringify(response)


expected = (vars = {}) ->
  outcome: 'success'
  reason: null
  user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36"
  browser: "Chrome 33.0.1750"
  os: "Mac OS X 10.9.2"
  ip: "127.0.0.1"
  location:
    city: "Austin"
    country_code: "US"
    latitude: 30.2966
    longitude: -97.7663
    postal_code: "78703"
    state: "TX"
    time_zone: "America/Chicago"
  snapshot_url: "http://snapshots.trustedform.com/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html"
  masked_cert_url: "https://cert.trustedform.com/e57c02509dda472de4aed9e8950a331fcfda6dc4"
  masked: false
  url: vars.url || null
  domain: vars.domain || "localhost"
  age_in_seconds: 172291
  time_on_page_in_seconds: null
  created_at: "2014-04-02T21:24:22Z"
  scans:
    found: []
    not_found: []
