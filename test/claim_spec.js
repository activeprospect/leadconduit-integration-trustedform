const assert = require('chai').assert;
const integration = require('../lib/claim');
const parser = require('leadconduit-integration').test.types.parser(integration.requestVariables());
const nock = require('nock');

beforeEach(() => {
  process.env.NODE_ENV = 'production';
});

describe('Claim', () => {

  it('should correctly handle a successful request', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
      .reply(201, standardResponse(), { 'X-Runtime': '0.497349' });

    integration.handle(baseRequest(), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });
  });

  it('should pass custom reference if one is present', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123%3Femail%3Dtest%40example.com&vendor=Foo%2C%20Inc.')
      .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
      .reply(201, standardResponse(), { 'X-Runtime': '0.497349' });

    const vars = {
      lead: {
        id: 'lead_id_123',
        trustedform_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012',
        reference: 'https://next.leadconduit.com/events/lead_id_123?email=test@example.com'
      }
    };

    integration.handle(baseRequest(vars), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });

  });

  it('should convert a http cert_url to https', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .matchHeader('Authorization', 'Basic WDpjOTM1MWZmNDlhOGUzOGEyMzQ5M2M2YjczMjhjNzYyOQ==')
      .reply(201, standardResponse(), { 'X-Runtime': '0.497349' });

    const req = baseRequest();
    req.lead.trustedform_cert_url = 'http://cert.trustedform.com/533c80270218239ec3000012';
    integration.handle(req, (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });
  });

  it('should capture scans found', (done) => {
    const scanText1 = 'some disclosure text';
    const scanText2 = 'other disclosure text';

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'scan%5B%5D=some%20disclosure%20text&scan%5B%5D=other%20disclosure%20text&reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({scans: { found: [scanText1, scanText2], not_found: [] }}));

    integration.handle(baseRequest({trustedform: {scan_required_text: [scanText1, scanText2]}}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.scans.found[0], scanText1);
      assert.equal(event.scans.found[1], scanText2);

      done();
    });

  });

  it('should calculate age in seconds with event_duration', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({ event_duration: 19999 }));

    integration.handle(baseRequest(), (err, event) => {
      assert.isNull(err);
      assert.equal(event.age_in_seconds, 13);

      done();
    });

  });

  it('should use a user-provided API key', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .matchHeader('Authorization', 'Basic WDphYmNkZWZnMTIzNDU2Nw==')
      .reply(201, standardResponse(), {'X-Runtime': '0.497349'});

    integration.handle(baseRequest({trustedform: {api_key: 'abcdefg1234567'}}), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    });
  });

  it('should use the parent location when it is present', (done) => {

    const host = 'yourhost';
    const url = `http://${host}:81/my_iframe.html`;

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({parentLocation: url}));

    integration.handle(baseRequest({trustedform: {api_key: 'abcdefg1234567'}}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.url, url);
      assert.equal(event.domain, host);
      assert.equal(event.website.parent_location, url);

      done();
    });

  });

  it('should send additional fields when present', (done) => {
    const baseReq = baseRequest({
      lead: {
        email: 'test@activeprospect.com',
        phone_1: '5122981234',
        phone_2: '5129184321',
        phone_3: '5126721243',
        id: 'lead_id_123',
        trustedform_cert_url: 'https://cert.trustedform.com/533c80270218239ec3000012'
      }
    });

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.&email=test%40activeprospect.com&phone_1=5122981234&phone_2=5129184321&phone_3=5126721243')
      .reply(201, standardResponse(), { 'X-Runtime': '0.497349' });

    integration.handle(baseReq, (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, expected());

      done();
    })


  });

  it('should handle failure response', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'scan%5B%5D=some%20disclosure%20text&scan!%5B%5D=free%20iPod%20from%20Obama!&reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({warnings: ['string found in snapshot'], scans: { found: [ 'free iPod from Obama!', 'some disclosure text' ]}}), {'X-Runtime': '0.497349'});

    integration.handle(baseRequest({ trustedform: { scan_forbidden_text: 'free iPod from Obama!', scan_required_text: 'some disclosure text' }}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'failure');
      assert.equal(event.reason, `Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')`);

      done();
    });

  });

  it('should set the correct reason when neither required or forbidden text are present', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'scan%5B%5D=some%20disclosure%20text&scan!%5B%5D=free%20iPod%20from%20Obama!&reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({warnings: ['string not found in snapshot'], scans: { not_found: [ 'free iPod from Obama!', 'some disclosure text' ]}}));

    integration.handle(baseRequest({ trustedform: { scan_forbidden_text: 'free iPod from Obama!', scan_required_text: 'some disclosure text' }}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'failure');
      assert.equal(event.reason, `Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text')`);

      done();
    });

  });

  it('should set failure outcome and reason when both required scan is missing and forbidden scan is present', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'scan%5B%5D=some%20disclosure%20text&scan!%5B%5D=free%20iPod%20from%20Obama!&reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(201, standardResponse({warnings: ['string not found in snapshot', 'string found in snapshot'], scans: { not_found: [ 'some disclosure text' ], found: [ 'free iPod from Obama!' ]}}));

    integration.handle(baseRequest({ trustedform: { scan_forbidden_text: 'free iPod from Obama!', scan_required_text: 'some disclosure text' }}), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'failure');
      assert.equal(event.reason, `Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text'); Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')`);

      done();
    });

  });

  it('should correctly handle claiming facebook certs', (done) => {
    nock('https://cert.trustedform.com')
      .post('/0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDg')
      .reply(201, facebookResponse());

    integration.handle(baseRequest({ source: { name: undefined }, lead: { trustedform_cert_url: 'https://cert.trustedform.com/0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDg' }}), (err, event) => {
      assert.isNull(err);
      assert.deepEqual(event, facebookEvent());
      done();
    });
  });

  it('should handle error response', (done) => {

    nock('https://cert.trustedform.com')
      .post('/533c80270218239ec3000012', 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123&vendor=Foo%2C%20Inc.')
      .reply(404, '{"message":"certificate not found"}', { 'content-type': 'application/json'} );

    integration.handle(baseRequest(), (err, event) => {
      assert.isNull(err);
      assert.equal(event.outcome, 'error');
      assert.equal(event.reason, 'TrustedForm error - certificate not found (404)');

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

const standardResponse = (vars = {}) => {
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

const facebookResponse = () => {
  return {
    age: 6,
    cert: {
      cert_id: '0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDG',
      created_at: '2020-06-22T18:51:40Z'
    },
    created_at: '2020-06-22T18:51:46Z',
    fingerprints: {
      matching: [],
      non_matching: []
    },
    id: '0305c844-0f04-4e8e-8179-49692685b0f7',
    reference: null,
    scans: {
      found: [],
      not_found: []
    },
    share_url: 'https://cert.trustedform.com/0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDG?shared_token=TqIvDcHVbBSlwO3SyiC_uYCB1pz1TJYntf_eHzf4zXvI_Lyqlh641meMMLxEhWKicaoO6rpDS05oigLMgtVYQ4itcbStqMIKkdZ-zVEyXvePZ_RXCVjlYugE1lJrZSebNtKJja7p6DNCy3RTtG4epHjeNApFjSW5DtTC-06zdUFHDuZ94csEjKAKjQGk0P5YL26z7bU2-mQzSaUyTTYebXqYIFvBoicdLhfk60t1awl_0j-_yt5pmB2fuz_G3KTyIG9pApY.wJZzJdLSHW1Wm1pGrVEDRg.C1cS1Vhh3HaKjmo78GALfw',
    vendor: null,
    warnings: []
  };
};

const expected = (vars = {}) => {
  return {
    outcome: 'success',
    reason: null,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36',
    browser: 'Chrome 33.0.1750',
    os: 'Mac OS X 10.9.2',
    ip: '127.0.0.1',
    token: '0dcf20941b6b4f196331ff7ae1ca534befa269dd',
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
    website: {
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
}

const facebookEvent = () => {
  return {
    age_in_seconds: 6,
    browser: undefined,
    created_at: '2020-06-22T18:51:40Z',
    domain: null,
    duration: undefined,
    fingerprints_summary: 'No Fingerprinting Data',
    ip: undefined,
    is_masked: undefined,
    location: {
      city: undefined,
      country_code: undefined,
      latitude: undefined,
      longitude: undefined,
      postal_code: undefined,
      state: undefined,
      time_zone: undefined,
    },
    masked_cert_url: undefined,
    os: undefined,
    outcome: 'success',
    reason: null,
    scans: {
      found: [],
      not_found: [],
    },
    share_url: 'https://cert.trustedform.com/0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDG?shared_token=TqIvDcHVbBSlwO3SyiC_uYCB1pz1TJYntf_eHzf4zXvI_Lyqlh641meMMLxEhWKicaoO6rpDS05oigLMgtVYQ4itcbStqMIKkdZ-zVEyXvePZ_RXCVjlYugE1lJrZSebNtKJja7p6DNCy3RTtG4epHjeNApFjSW5DtTC-06zdUFHDuZ94csEjKAKjQGk0P5YL26z7bU2-mQzSaUyTTYebXqYIFvBoicdLhfk60t1awl_0j-_yt5pmB2fuz_G3KTyIG9pApY.wJZzJdLSHW1Wm1pGrVEDRg.C1cS1Vhh3HaKjmo78GALfw',
    snapshot_url: undefined,
    time_on_page_in_seconds: null,
    token: '0.Ca5p10CcJX-Xez5OHgF5hkp_mNc166yLBQTEOli6gwengwvrGgFVTkD31eCLCMyExX9JnreuobnY063YIPtpk9FF9gFcoZH13q9ooZlNTXEaclhm.qnOgos1woq9gNjKB71dg9A.11EiuZaqmjiScX8GrYbpDG',
    url: undefined,
    user_agent: undefined,
    warnings: [],
    website: {
      location: undefined,
      parent_location: undefined,
    }
  };
}
