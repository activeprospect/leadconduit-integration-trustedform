const assert = require('chai').assert;
const integration = require('../lib/consent');
const parser = require('leadconduit-integration').test.types.parser(integration.requestVariables());
const nock = require('nock');

describe('Consent (incl. common functionality with Consent + Data)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  describe('handle', () => {
    const queryString = 'reference=https%3A%2F%2Fapp.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.&scan_delimiter=%7C';

    it('should handle a successful request', (done) => {
      nock('https://cert.trustedform.com')
        .post('/533c80270218239ec3000012', queryString)
        .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
        .matchHeader('api-version', '3.0')
        .reply(201, consentResponse());

      integration.handle(baseRequest(), (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, consentExpected());
        done();
      });
    });

    it('should handle an error request', (done) => {
      nock('https://cert.trustedform.com')
        .post('/533c80270218239ec3000012', queryString)
        .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
        .matchHeader('api-version', '3.0')
        .reply(500, '{ "errors": { "detail": "Internal Server Error" }}', { 'content-type': 'application/json' });

      integration.handle(baseRequest(), (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, { outcome: 'error', reason: 'TrustedForm error - Internal Server Error (500)' });
        done();
      });
    });
  });

  describe('Consent response parsing', () => {
    it('should parse a basic success response', (done) => {
      const parsed = integration.parseResponse(201, consentResponse(), baseRequest());
      assert.deepEqual(parsed, consentExpected());
      done();
    });

    it('should fall back to masked if is_masked not present', (done) => {
      const response = consentResponse();
      delete response.is_masked;
      response.masked = true;
      const parsed = integration.parseResponse(201, response, baseRequest());
      assert.equal(parsed.is_masked, true);
      done();
    });

    it('should parse a success response with scans', (done) => {
      const request = baseRequest({ trustedform: { scan_required_text: ['temperance', 'diligence'] } });
      const scans = {
        forbidden_found: ['gluttony'],
        forbidden_not_found: ['slothfulness'],
        required_found: ['temperance'],
        required_not_found: ['diligence']
      };
      const response = consentResponse({ scans: scans });
      const parsed = integration.parseResponse(201, response, request);

      const expected = consentExpected({
        forbidden_scans_found: ['gluttony'],
        forbidden_scans_not_found: ['slothfulness'],
        num_required_matched: 'some',
        required_scans_found: ['temperance'],
        required_scans_not_found: ['diligence']
      });
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse a success response with matched fingerprint', (done) => {
      const responseOverride = {
        fingerprints: {
          matching: ['bc8abb288e52e145695ffc16969c2ec6eba82ff4'],
          non_matching: ['12864b281c728bdca0f2102dba31308e1014fe4a']
        },
        warnings: []
      };
      const expectedOverride = {
        fingerprints_summary: 'Some Matched',
        warnings: []
      };
      const parsed = integration.parseResponse(201, consentResponse(responseOverride), baseRequest());
      assert.deepEqual(parsed, consentExpected(expectedOverride));
      done();
    });

    it('should not parse cert data even if present', (done) => {
      const parsed = integration.parseResponse(201, consentPlusDataResponse({ plusData: true }), baseRequest());
      assert.deepEqual(parsed, consentExpected());
      done();
    });

    it('should parse a failure response', (done) => {
      const expected = consentExpected({
        outcome: 'failure',
        reason: 'yo this failed'
      });
      const parsed = integration.parseResponse(201, consentResponse({ outcome: 'failure', reason: 'yo this failed' }), baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse an unauthorized failure response', (done) => {
      const expected = {
        outcome: 'failure',
        reason: 'TrustedForm error - Unauthorized (401)'
      };
      const response = { errors: { detail: 'Unauthorized' }, message: 'Unauthorized' };
      const parsed = integration.parseResponse(401, response, baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse a 404 failure response', (done) => {
      const expected = {
        outcome: 'failure',
        reason: 'certificate not found'
      };
      const response = { outcome: 'failure', reason: 'certificate not found' };
      const parsed = integration.parseResponse(404, response, baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse a 405 failure response', (done) => {
      const expected = {
        outcome: 'failure',
        reason: 'certificate not claimable'
      };
      const response = { outcome: 'failure', reason: 'certificate not claimable' };
      const parsed = integration.parseResponse(405, response, baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse a 422 failure response', (done) => {
      const expected = {
        outcome: 'failure',
        reason: 'certificate has been claimed too many times'
      };
      const response = { outcome: 'failure', reason: 'certificate has been claimed too many times' };
      const parsed = integration.parseResponse(422, response, baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    it('should parse an error outcome', (done) => {
      const expected = consentExpected({ outcome: 'error', reason: 'an error occurred' });
      const response = consentResponse({ outcome: 'error', reason: 'an error occurred' });
      const parsed = integration.parseResponse(201, response, baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });
  });

  describe('Consent + Insights response parsing', () => {
    it('should parse additional `cert` data', (done) => {
      const parsed = integration.parseResponse(201, consentPlusDataResponse(), baseRequest({ plusData: true }));
      assert.deepEqual(parsed, consentPlusDataExpected());
      done();
    });

    it('should fall back to mobile if is_mobile not present', (done) => {
      const response = consentPlusDataResponse();
      delete response.cert.is_mobile;
      response.cert.mobile = false;
      const parsed = integration.parseResponse(201, response, baseRequest({ plusData: true }));
      assert.equal(parsed.is_mobile, false);
      done();
    });

    it('should fall back to framed if is_framed not present', (done) => {
      const response = consentPlusDataResponse();
      delete response.cert.is_framed;
      response.cert.framed = true;
      const parsed = integration.parseResponse(201, response, baseRequest({ plusData: true }));
      assert.equal(parsed.is_framed, true);
      done();
    });
  });
});

const baseRequest = (extraKeys = {}) => {
  const baseReq = {
    activeprospect: {
      api_key: 'c9351ff49a8e38a23493c6b7328c7629'
    },
    lead: {
      id: 'lead_id_123',
      trustedform_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012'
    },
    source: {
      name: 'Foo, Inc.'
    }
  };
  return parser(Object.assign(baseReq, extraKeys));
};

const consentResponse = (override = {}) => {
  const response = {
    fingerprints: {
      matching: [],
      non_matching: [
        '12864b281c728bdca0f2102dba31308e1014fe4a',
        '72a34929a612536dde7e56df15ec7278f2ee97ec'
      ]
    },
    is_masked: false,
    masked_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012',
    outcome: 'success',
    reason: '',
    scans: {
      forbidden_found: [],
      forbidden_not_found: [],
      required_found: [],
      required_not_found: []
    },
    warnings: [
      'none of the provided fingerprints match'
    ]
  };
  return Object.assign(response, override);
};

const consentPlusDataResponse = (override = {}) => {
  const cert = {
    cert: {
      age_seconds: 87,
      approx_ip_geo: {
        city: 'Austin',
        country_code: 'US',
        lat: 30.4548,
        lon: -97.7664,
        postal_code: '78729',
        state: 'TX',
        time_zone: 'America/Chicago'
      },
      browser: {
        full: 'Mobile Safari 13.1.2',
        name: 'Mobile Safari',
        version: {
          full: '13.1.2',
          major: '13',
          minor: '1',
          patch: '2'
        }
      },
      cert_id: '7d7207c4b20f9cb5692f02e91871378bced1061d',
      created_at: '2021-11-18T17:57:09Z',
      event_duration_ms: 20289,
      expires_at: '2021-11-24T17:57:09Z',
      form_input_method: ['typing'],
      is_framed: false,
      ip: '68.203.9.158',
      kpm: 0,
      is_mobile: true,
      operating_system: {
        full: 'iOS 13.6.1',
        name: 'iOS',
        version: {
          full: '13.6.1',
          major: '13',
          minor: '6',
          patch: '1'
        }
      },
      page_id: '6058ba082e1fa93abc1b0c20',
      page_url: 'https://activeprospect.github.io/trustedform_moose.html',
      parent_page_url: null,
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
      wpm: 0
    }
  };
  return consentResponse(Object.assign(cert, override));
};

const consentExpected = (override = {}) => {
  const result = {
    outcome: 'success',
    reason: null,
    masked_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012',
    is_masked: false,
    forbidden_scans_found: [],
    forbidden_scans_not_found: [],
    required_scans_found: [],
    required_scans_not_found: [],
    fingerprints_summary: 'None Matched',
    warnings: ['none of the provided fingerprints match']
  };
  return Object.assign(result, override);
};

const consentPlusDataExpected = () => {
  const plusData = {
    age_in_seconds: 87,
    city: 'Austin',
    country_code: 'US',
    latitude: 30.4548,
    longitude: -97.7664,
    postal_code: '78729',
    forbidden_scans_found: [],
    forbidden_scans_not_found: [],
    required_scans_found: [],
    required_scans_not_found: [],
    state: 'TX',
    time_zone: 'America/Chicago',
    browser: 'Mobile Safari 13.1.2',
    is_mobile: true,
    os: 'iOS 13.6.1',
    token: '7d7207c4b20f9cb5692f02e91871378bced1061d',
    time_on_page_in_seconds: 20.289,
    created_at: '2021-11-18T17:57:09Z',
    expires_at: '2021-11-24T17:57:09Z',
    form_input_method: ['typing'],
    is_framed: false,
    ip: '68.203.9.158',
    kpm: 0,
    wpm: 0,
    page_url: 'https://activeprospect.github.io/trustedform_moose.html',
    parent_page_url: null,
    domain: null
  };
  return consentExpected(plusData);
};
