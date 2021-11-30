const assert = require('chai').assert;
const integration = require('../lib/consent');
const parser = require('leadconduit-integration').test.types.parser(integration.requestVariables());
const nock = require('nock');

describe('Consent', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });

  describe('handle', () => {
    it('should handle a successful request', (done) => {
      nock('https://cert.trustedform.com')
        .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
        .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
        .matchHeader('api-version', '3.0')
        .reply(201, standardResponse());

      integration.handle(baseRequest(), (err, event) => {
        assert.isNull(err);
        assert.deepEqual(event, baseExpected());
        done();
      });
    });

    // todo: verify after API docs finalized
    it('should handle an error request', (done) => {
      nock('https://cert.trustedform.com')
        .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
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

  describe('response parsing', () => {
    it('should parse a basic success response', (done) => {
      const parsed = integration.parseResponse(201, standardResponse(), baseRequest());
      assert.deepEqual(parsed, baseExpected());
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
      const response = standardResponse({ scans: scans });
      const parsed = integration.parseResponse(201, response, request);

      const expected = baseExpected({
        forbidden_scans_found: ['gluttony'],
        forbidden_scans_not_found: ['slothfulness'],
        num_required_matched: 'some',
        required_scans_found: ['temperance'],
        required_scans_not_found: ['diligence']
      });
      assert.deepEqual(parsed, expected);
      done();
    });

    // todo: verify after API docs finalized
    it('should parse a failure response', (done) => {
      const expected = baseExpected({
        outcome: 'failure',
        reason: 'yo this failed'
      });
      const parsed = integration.parseResponse(201, standardResponse({ outcome: 'failure', reason: 'yo this failed' }), baseRequest());
      assert.deepEqual(parsed, expected);
      done();
    });

    // todo: verify after API docs finalized
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

    // todo: verify after API docs finalized
    it('should parse an error outcome', (done) => {
      const expected = baseExpected({ outcome: 'error', reason: 'an error occurred' });
      const response = standardResponse({ outcome: 'error', reason: 'an error occurred' });
      const parsed = integration.parseResponse(201, response, baseRequest());
      assert.deepEqual(parsed, expected);
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

  const hash = Object.assign(baseReq, extraKeys);

  return parser(hash);
};

const standardResponse = (override = {}) => {
  const response = {
    fingerprints: {
      matching: [],
      non_matching: []
    },
    masked: false,
    masked_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012',
    outcome: 'success',
    reason: '',
    scans: {},
    warnings: []
  };
  return Object.assign(response, override);
};

const baseExpected = (override = {}) => {
  const result = {
    outcome: 'success',
    reason: null,
    masked_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012',
    is_masked: false,
    fingerprints_summary: 'No Fingerprinting Data',
    warnings: []
  };
  return Object.assign(result, override);
};
