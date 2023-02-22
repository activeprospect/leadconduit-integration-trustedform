const assert = require('chai').assert;
const integration = require('../lib/insights');
const parser = require('leadconduit-integration').test.types.parser(integration.request.variables());

describe('Insights', () => {
  beforeEach(() => {
    process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN = '123456';
  });

  describe('Validate', () => {
    it('should pass if token env var set', () => {
      assert.isUndefined(integration.validate(baseVars()));
    });

    it('should skip if token env var not set', () => {
      delete process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN;
      assert.equal(integration.validate(baseVars()), 'Missing TrustedForm Data Service token');
    });

    it('should skip if cert url is not provided', () => {
      const vars = baseVars();
      delete vars.lead.trustedform_cert_url;
      assert.equal(integration.validate(vars), 'TrustedForm cert URL must not be blank');
    });

    it('should skip if cert url is not valid', () => {
      const vars = baseVars({ lead: { trustedform_cert_url: 'https://cert.trustedform.com/example' } });
      assert.equal(integration.validate(vars), 'TrustedForm cert URL must be valid');
    });

    it('should pass if ping url provided', () => {
      process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN = 'foo';
      const error = integration.validate({ lead: { trustedform_cert_url: 'https://ping.trustedform.com/0.whatever' } });
      assert.isUndefined(error);
    });

    it('should pass if staging ping url provided', () => {
      process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN = 'foo';
      const error = integration.validate({ lead: { trustedform_cert_url: 'https://ping.staging.trustedform.com/0.whatever' } });
      assert.isUndefined(error);
    });
  });

  describe('Request', () => {
    it('should properly format request', () => {
      const expected = {
        url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985/peek',
        method: 'POST',
        body: 'scan%5B%5D=some%20disclosure%20text&scan%5B%5D=other%20disclosure%20text&scan_delimiter=%7C&phone_1=5122981234&email=test%40activeprospect.com',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer 123456'
        }
      };
      assert.deepEqual(integration.request(baseVars()), expected);
    });

    it('should mask token on second invocation', () => {
      const vars = baseVars();
      integration.request(vars);
      assert.equal(integration.request(vars).headers.Authorization, 'Bearer ******');
    });
  });

  describe('Response', () => {
    let tfResponse, expected;
    beforeEach(() => {
      tfResponse = {
        age: 44,
        fingerprints: {
          matching: ['test@activeprospect.com'],
          non_matching: ['5122981234']
        },
        masked: true,
        scans: {
          found: ['some disclosure text'],
          not_found: ['other disclosure text']
        },
        warnings: ['some warning'],
        cert: {
          cert_id: '533c80270218239ec3000012',
          browser: 'Chrome 84.0.4147',
          device: 'Linux',
          operating_system: 'Linux',
          domain: 'activeprospect.com',
          consented_at: '2020-10-19T14:01:43Z',
          created_at: '2020-10-19T14:01:44Z',
          event_duration: 38,
          expires_at: '2020-10-22T14:01:44Z',
          form_input_method: [
            'typing',
            'autofill',
            'paste'
          ],
          framed: true,
          geo: {
            lat: 45.8696,
            lon: -119.688,
            city: 'Boardman',
            state: 'OR',
            postal_code: '97818',
            country_code: 'US',
            time_zone: 'America/Los_Angeles'
          },
          ip: '52.35.61.232',
          page_url: 'https://activeprospect.com/example',
          parent_page_url: 'https://activeprospect.com',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
          wpm: 50,
          kpm: 112
        }
      };

      expected = {
        outcome: 'success',
        billable: 1,
        age: 44,
        browser: 'Chrome 84.0.4147',
        consented_at: '2020-10-19T14:01:43Z',
        created_at: '2020-10-19T14:01:44Z',
        device: 'Linux',
        domain: 'activeprospect.com',
        event_duration: 38,
        expires_at: '2020-10-22T14:01:44Z',
        framed: true,
        form_input_method: [
          'typing',
          'autofill',
          'paste'],
        has_consented: true,
        city: 'Boardman',
        country_code: 'US',
        lat: 45.8696,
        lon: -119.688,
        postal_code: '97818',
        state: 'OR',
        time_zone: 'America/Los_Angeles',
        ip: '52.35.61.232',
        wpm: 50,
        kpm: 112,
        page_url: 'https://activeprospect.com/example',
        operating_system: 'Linux',
        parent_page_url: 'https://activeprospect.com',
        cert_id: '533c80270218239ec3000012',
        user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        fingerprints_matching: ['test@activeprospect.com'],
        fingerprints_non_matching: ['5122981234'],
        is_masked: true,
        scans_found: ['some disclosure text'],
        scans_not_found: ['other disclosure text'],
        warnings: ['some warning']
      };
    });

    it('should correctly handle success response', () => {
      const res = {
        status: 201,
        body: JSON.stringify(tfResponse)
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should handle response without consented_at', () => {
      delete tfResponse.cert.consented_at;
      const res = {
        status: 201,
        body: JSON.stringify(tfResponse)
      };
      delete expected.consented_at;
      expected.has_consented = false;
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should correctly handle failure responses', () => {
      const res = {
        status: 404,
        body: JSON.stringify({
          errors: {
            detail: 'cert not found'
          }
        })
      };
      const expected = {
          outcome: 'failure',
          reason: 'cert not found',
          billable: 0
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should correctly handle error responses', () => {
      const res = {
        status: 500,
        body: 'internal server error'
      };
      const expected = {
          outcome: 'error',
          reason: 'unable to parse response',
          billable: 0
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });
  });
});

const baseVars = (custom) => {
  let vars = {
    lead: {
      email: 'test@activeprospect.com',
      phone_1: '5122981234',
      trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985'
    },
    trustedform: {
      scan_required_text: [
        'some disclosure text',
        'other disclosure text'
      ]
    }
  };
  vars = Object.assign(vars, custom);

  return parser(vars);
};
