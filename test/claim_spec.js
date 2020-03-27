const assert = require('chai').assert;
const integration = require('../lib/claim');
const tk = require('timekeeper');
const emailtype = require('leadconduit-types').email;
const phonetype = require('leadconduit-types').phone;
const parser = require('leadconduit-integration').test.types.parser(integration.requestVariables());
const nock = require('nock');

describe('Cert URL validate', () => {

  it('should error on undefined cert url', () => {
    const error = integration.validate({lead: {}});
    assert.equal(error, 'TrustedForm cert URL must not be blank');
  });

  it('should error on null cert url', () => {
    const error = integration.validate({lead: { trustedform_cert_url: null }});
    assert.equal(error, 'TrustedForm cert URL must not be blank');
  });

  it('should error on invalid cert url', () => {
    const error = integration.validate({lead: { trustedform_cert_url: 'http://someothersite.com' }});
    assert.equal(error, 'TrustedForm cert URL must be valid');

    const error2 = integration.validate({lead: { trustedform_cert_url: 'KOWABUNGAhttps://cert.trustedform.com/' }});
    assert.equal(error2, 'TrustedForm cert URL must be valid');
  });

  it('should not error when cert url is valid', () => {
    const error = integration.validate({lead: { trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985' }});
    assert.isUndefined(error);

    const error2 = integration.validate({lead: { trustedform_cert_url: 'https://cert.trustedform.com/0.YpUzjEEpW3vIkuEJFst4gSDQ7KiFGLZGYkTwIMzRXt8TxcnRUnx3p1U34EWx6KUZ9hyJUuwVm11qoEodrSfsXYDLS7LDFWOyeuCP2MNCHdnAXYkG.IW3iXaUjponmuoB4HNdsWQ.H6cCZ53mOpSXUtUlpdwlWw' }});
    assert.isUndefined(error2);

  });
});

describe('Claim', () => {

  it('should correctly handle a successful request', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012?vendor=Foo,%20Inc.&')
      .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
      .reply(201, responseBody(), { 'X-Runtime': '0.497349' });

    integration.handle(baseRequest(), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });
  });

  it('should use a user-provided API key', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012?vendor=Foo,%20Inc.&')
      .matchHeader('Authorization', 'Basic WDphYmNkZWZnMTIzNDU2Nw==')
      .reply(201, responseBody(), {'X-Runtime': '0.497349'});

    integration.handle(baseRequest({trustedform: {api_key: 'abcdefg1234567'}}), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });
  });

  it('should handle failure response', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012?vendor=Foo,%20Inc.&')
      .reply(201, responseBody({warnings: ['string found in snapshot']}), {'X-Runtime': '0.497349'});

    integration.handle(baseRequest({ trustedform: { scan_forbidden_text: 'scan' }}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'failure');
      assert.equal(event.reason, `Forbidden scan text found in TrustedForm snapshot (found 0: '')`);

      done();
    })

  });

  it('should handle error response', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012?vendor=Foo,%20Inc.&')
      .reply(503, '<h1>This website is under heavy load</h1><p>We\'re sorry, too many people are accessing this website at the same time. We\'re working on this problem. Please try again later.</p>');

    integration.handle(baseRequest(), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'error');
      assert.equal(event.reason, 'Error: Could not claim form');

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


const responseBody = (vars = {}) => {
  const response = {
    cert: {
      browser: 'Chrome 33.0.1750',
      claims: [
        {
          created_at: '2014-04-02T21:24:55Z',
          expires_at: '2019-04-01T21:24:55Z',
          fingerprints: {
            matching: [],
            non_matching: []
          },
          id: '533c80270218239ec3000012',
          page_id: '533c76bd0218239ec3000007',
          reference: null,
          scans: null,
          vendor: null,
          warnings: []
        }
      ],
      created_at: '2014-04-02T21:24:22Z',
      expires_at: '2014-04-05T21:24:22Z',
      framed: false,
      geo: {
        city: 'Austin',
        country_code: 'US',
        lat: 30.2966,
        lon: -97.7663,
        postal_code: '78703',
        state: 'TX',
        time_zone: 'America/Chicago'
      },
      ip: '127.0.0.1',
      location: vars.location || null,
      operating_system: 'Mac OS X 10.9.2',
      parent_location: vars.parentLocation || null,
      snapshot_url: 'http://snapshots.trustedform.com/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html',
      token: '0dcf20941b6b4f196331ff7ae1ca534befa269dd',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
    },
    created_at: '2014-04-02T21:24:55Z',
    expires_at: '2019-04-01T21:24:55Z',
    fingerprints: {
      matching: [],
      non_matching: []
    },
    id: '533c80270218239ec3000012',
    page_id: '533c76bd0218239ec3000007',
    masked_cert_url: 'https://cert.trustedform.com/e57c02509dda472de4aed9e8950a331fcfda6dc4',
    masked: false,
    reference: null,
    share_url: 'https://cert.trustedform.com/935818f23f1227002279aee8ce2db094c9bfae90?shared_token=REALLONGSHAREDTOKENGOESHERE',
    scans: vars.scans || null,
    vendor: null,
    warnings: vars.warnings || []
  };

  if (vars.event_duration) { response.cert.event_duration = vars.event_duration; }
  if (vars.claims) { response.cert.claims = response.cert.claims.concat(vars.claims); }

  return response;
};


const expected = (vars = {}) => {
  return {
    outcome: 'success',
    reason: null,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36',
    browser: 'Chrome 33.0.1750',
    os: 'Mac OS X 10.9.2',
    ip: '127.0.0.1',
    location: {
      city: 'Austin',
      country_code: 'US',
      latitude: 30.2966,
      longitude: -97.7663,
      postal_code: '78703',
      state: 'TX',
      time_zone: 'America/Chicago'
    },
    snapshot_url: 'http://snapshots.trustedform.com/0dcf20941b6b4f196331ff7ae1ca534befa269dd/index.html',
    masked_cert_url: 'https://cert.trustedform.com/e57c02509dda472de4aed9e8950a331fcfda6dc4',
    is_masked: false,
    share_url: 'https://cert.trustedform.com/935818f23f1227002279aee8ce2db094c9bfae90?shared_token=REALLONGSHAREDTOKENGOESHERE',
    url: vars.url || null,
    domain: vars.domain || null,
    website:{
      parent_location: vars.parent_location || null,
      location: vars.location || null
    },
    age_in_seconds: 33,
    time_on_page_in_seconds: null,
    created_at: '2014-04-02T21:24:22Z',
    scans: {
      found: [],
      not_found: []
    },
    duration: '0.497349',
    fingerprints_summary: 'No Fingerprinting Data',
    warnings: vars.warnings || []
  };
};
