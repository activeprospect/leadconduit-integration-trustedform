const assert = require('chai').assert;
const integration = require('../lib/data_service');
const parser = require('leadconduit-integration').test.types.parser(integration.request.variables());

describe('Data Service', () => {

  describe('Request', () => {

    beforeEach(() => {
      process.env.TRUSTEDFORM_DATA_SERVICE_TOKEN = '123456';
    });

    it('should properly format request', () => {
      const expected = {
        url: 'https://cert.trustedform.com/533c80270218239ec3000012/peek',
        method: 'POST',
        body: 'scan%5B%5D=some%20disclosure%20text&scan%5B%5D=other%20disclosure%20text&phone_1=5122981234&email=test%40activeprospect.com',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer 123456`
        }
      }
      assert.deepEqual(integration.request(baseVars()), expected);
    });

    it('should mask token on second invocation', () => {
      let vars = baseVars();
      integration.request(vars);
      assert.equal(integration.request(vars).headers.Authorization, 'Bearer ******');
    });
  });

  describe('Response', () => {

    it('should correctly handle success responses', () => {
      const res = {
        status: 201,
        body: JSON.stringify({
          "age": 44,
          "fingerprints": {
            "matching": [ "test@activeprospect.com" ],
            "non_matching": [ "5122981234" ]
          },
          "masked": true,
          "scans": {
            "found": [ "some disclosure text" ],
            "not_found": [ "other disclosure text" ]
          },
          "warnings": [ "some warning" ],
          "cert": {
            "cert_id": "533c80270218239ec3000012",
            "browser": "Chrome 84.0.4147",
            "device": "Linux",
            "operating_system": "Linux",
            "created_at": "2020-10-19T14:01:44Z",
            "event_duration": 38,
            "expires_at": "2020-10-22T14:01:44Z",
            "framed": true,
            "geo": {
              "lat": 45.8696,
              "lon": -119.688,
              "city": "Boardman",
              "state": "OR",
              "postal_code": "97818",
              "country_code": "US",
              "time_zone": "America/Los_Angeles"
            },
            "ip": "52.35.61.232",
            "page_url": "https://activeprospect.com/example",
            "parent_page_url": "https://activeprospect.com",
            "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
            "wpm": 50,
            "kpm": 112
          }
        })
      };
      const expected = {
        data_service: {
          outcome: 'success',
          billable: 1,
          age: 44,
          browser: 'Chrome 84.0.4147',
          created_at: '2020-10-19T14:01:44Z',
          device: 'Linux',
          event_duration: 38,
          expires_at: '2020-10-22T14:01:44Z',
          framed: true,
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
          masked: true,
          scans_found: ['some disclosure text'],
          scans_not_found: ['other disclosure text'],
          warnings: ['some warning']
        }
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should correctly handle failure responses', () => {
      const res = {
        status: 404,
        body: JSON.stringify({
          "errors": {
            "detail": "cert not found"
          }
        })
      };
      const expected = {
        data_service: {
          outcome: 'failure',
          reason: 'cert not found',
          billable: 0
        }
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should correctly handle error responses', () => {
      const res = {
        status: 500,
        body: 'internal server error'
      };
      const expected = {
        data_service: {
          outcome: 'error',
          reason: 'unable to parse response',
          billable: 0
        }
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    })
  });
});

const baseVars = (custom) => {
  let vars = {
    lead: {
      email: 'test@activeprospect.com',
      phone_1: '5122981234',
      trustedform_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012'
    },
    trustedform: {
      scan_required_text: [
        'some disclosure text',
        'other disclosure text'
      ]
    }
  }
  vars = Object.assign(vars, custom);

  return parser(vars);
};
