const assert = require('chai').assert;
const integration = require('../lib/v4');
const parser = require('leadconduit-integration').test.types.parser(integration.request.variables());
const {merge} = require('lodash');

describe('v4', () => {

  describe('Validate', () => {
    it('should pass when all required fields are present', () => {
      assert.isUndefined(integration.validate(baseVars()));
    });

    it('should require that a trustedform product is selected', () => {
      assert.equal(integration.validate(baseVars({
        trustedform: {
          retain: false,
          insights: false
        }
      })), 'a TrustedForm product must be selected');
    });

    it('should require an email or phone number if retain is selected', () => {
      let vars = baseVars({trustedform: {insights: false}, lead: {email: null, phone_1: null}});
      assert.equal(integration.validate(vars), 'an email address or phone number is required to use TrustedForm Retain');
      vars = baseVars({trustedform: {insights: false}, lead: {phone_1: null}});
      assert.isUndefined(integration.validate(vars));
      vars = baseVars({trustedform: {insights: false}, lead: {email: null}});
      assert.isUndefined(integration.validate(vars));
    });

    it('should require at least one property selected for insights', () => {
      let vars = baseVars({trustedform: {retain: false, age: null, domain: null, location: null}});
      assert.equal(integration.validate(vars), 'no properties selected for TrustedForm Insights');
    });
  });

  describe('request', () => {
    it('should correctly format request', () => {
      const expected = {
        method: 'POST',
        url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
        body: JSON.stringify({
          match_lead: {
            email: 'test@activeprospect.com',
            phone: '5122981234'
          },
          retain: {
            reference: 'https://app.leadconduit.com/events/4567',
            vendor: 'Acme, Inc.'
          },
          insights: {
            properties: ['age', 'domain', 'approx_ip_geo']
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'api-version': '4.0',
          Authorization: 'Basic WDoxMjM0'
        }
      };
      assert.deepEqual(integration.request(baseVars()), expected);
    });
  });
});

const baseVars = (custom) => {
  let vars = {
    lead: {
      email: 'test@activeprospect.com',
      phone_1: '5122981234',
      trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
      id: '4567'
    },
    trustedform: {
      retain: 'true',
      insights: 'true',
      age: 'true',
      domain: 'true',
      location: 'true'
    },
    activeprospect: {
      api_key: '1234'
    },
    source: {
      name: 'Acme, Inc.'
    }
  };
  vars = merge(vars, custom);
  return parser(vars);
};
