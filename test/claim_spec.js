const assert = require('chai').assert;
const integration = require('../lib/claim');
const tk = require('timekeeper');
const emailtype = require('leadconduit-types').email;
const phonetype = require('leadconduit-types').phone;
const parser = require('leadconduit-integration').test.types.parser(integration.request.variables());

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
  });

  it('should not error when cert url is valid', () => {
    const error = integration.validate({lead: { trustedform_cert_url: 'https://cert.trustedform.com/' }});
    assert.isUndefined(error);

    const error2 = integration.validate({lead: { trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985' }});
    assert.isUndefined(error2);
  });
});

describe('Claim Request', () => {
  let request;
  let  fullRequest;
  const trustedform_cert_url = 'https://cert.trustedform.com/533c80270218239ec3000012';

  beforeEach(() => {
    request = integration.request(fullRequest);
  });

  context('without parameters', () => {

    before(() => {
      fullRequest = baseRequest();
    });

    it('uses the claim id in the url', () => {
      assert.equal(request.url, trustedform_cert_url);
    });

    it('uses the api_key in the auth header', () => {
      assert.equal(request.headers.Authorization, 'Basic QVBJOmM5MzUxZmY0OWE4ZTM4YTIzNDkzYzZiNzMyOGM3NjI5');
    });

    it('is a POST request type', () => {
      assert.equal(request.method, 'POST');
    });

    it('accepts JSON', () => {
      assert.equal(request.headers.Accept, 'application/json');
    });

    it('has a form-urlencoded content-type', () => {
      assert.equal(request.headers['Content-Type'], 'application/x-www-form-urlencoded');
    });

    it('includes the reference in the URL', () => {
      assert.include(request.body, 'reference=https%3A%2F%2Fnext.leadconduit.com%2Fevents%2Flead_id_123');
    });

    it('includes the vendor in the URL', () => {
      assert.include(request.body, 'vendor=Foo%2C%20Inc.');
    });
  });

  context('with a scan parameter', () => {
    let scan = 'string';

    before(() => {
      fullRequest = baseRequest({ trustedform: { scan_required_text: scan }});
    });

    it('includes the parameter in the URL', () => {
      assert.include(request.body, `scan%5B%5D=${scan}`);
    });
  });

  context('with multiple scan parameters', () => {
    const first = 'first';
    const last  = 'last';

    before(() => {
      fullRequest = baseRequest({ trustedform: { scan_required_text: [ first, last ] }});
    });

    it('includes the parameter in the URL', () =>{
      assert.include(request.body, `scan%5B%5D=${first}&scan%5B%5D=${last}`);
    });
  });

  context('with a scan_forbidden_text parameter',() => {
    const scan = 'string';

    before(() => {
      fullRequest = baseRequest({ trustedform: { scan_forbidden_text: scan }});
    });

    it('includes the parameter in the URL', () => {
      assert.include(request.body, `scan!%5B%5D=${scan}`);
    });
  });

  context('with multiple scan_forbidden_text parameters', () => {
    const first = 'first';
    const last  = 'last';

    before(() => {
      fullRequest = baseRequest({ trustedform: { scan_forbidden_text: [ first, last ] }});
    });

    it('includes the parameters in the URL', () => {
      assert.include(request.body, `scan!%5B%5D=${first}&scan!%5B%5D=${last}`);
    });
  });

  context('with multiple parameters', () => {
    const scan          = 'fooscan';
    const scanForbidden = 'barscan';

    before( () => {
      fullRequest = baseRequest({ trustedform: { scan_required_text: scan, scan_forbidden_text: scanForbidden }});
    });

    it('includes the parameters in the URL', () => {
      assert.include(request.body, `scan%5B%5D=${scan}&scan!%5B%5D=${scanForbidden}`);
    });
  });

  context('with a lead email', () => {
    const email = emailtype.parse('TomJones@vegas.com');

    before(() => {
      fullRequest = baseRequest({ lead: { email: email }});
    });

    it('includes the parameters in the URL', () => {
      assert.include(request.body, `email=${encodeURIComponent(email)}`);
    });
  });

  context('with a lead phone_1', () => {
    const phone = phonetype.parse('512-789-1111');

    before(() => {
      fullRequest = baseRequest({ lead: { phone_1: phone }});
    });

    it('includes the parameters in the URL', () => {
      assert.include(request.body, `phone_1=${phone}`);
    });
  });

  context('with a lead phone_2', () => {
    const phone = phonetype.parse('512.555.5785');

    before(() => {
      fullRequest = baseRequest({ lead: { phone_2: phone }});
    });

    it('includes the parameters in the URL', () => {
      assert.include(request.body, `phone_2=${phone}`);
    });
  });

  context('without a lead phone_3', () => {
    const phone = null;

    before(() => {
      fullRequest = baseRequest({ lead: { phone_3: phone }});
    });

    it('doesnt include the parameters in the URL', () => {
      assert.notInclude(request.body, 'phone_3');
    });
  });

  context('with trustedform.vendor', () => {
    const vendor = 'E Corp.';

    before(() => {
      fullRequest = baseRequest({ trustedform: { vendor: vendor }});
    });

    it('should use trustedform.vendor', () => {
      assert.include(request.body, 'vendor=E%20Corp.');
    });

    it('should ignore source', () => {
      assert.notInclude(request.body, 'vendor=Foo%2C%20Inc.');
    });
  });
});

describe('with more than one cert_url', () => {

  it('ignores empty value', () => {
    const claimUrl = 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985';

    const request = integration.request(baseRequest({ lead: { trustedform_cert_url: ['', claimUrl] }}));
    assert.equal(request.url, claimUrl);
  });

  it('uses the first value', () => {
    const claimUrl1 = 'https://cert.trustedform.com/1111111111111111111111111111111111111111';
    const claimUrl2 = 'https://cert.trustedform.com/2222222222222222222222222222222222222222';

    const request = integration.request(baseRequest({ lead: { trustedform_cert_url: [claimUrl1, claimUrl2] }}));
    assert.equal(request.url, claimUrl1);
  });
});

describe('Claim Response', () => {

  const getResponse = (body, vars = {}) => {
    const res = {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'X-Runtime': 0.497349
      },
      body: responseBody(body)
    };
    return integration.response(vars, {}, res);
  };

  context('a successful response', () => {

    beforeEach(() => {
      tk.freeze(new Date(1396646152539));
    });

    afterEach(() => {
      tk.reset();
    });

    it('uses the location when there is no parent location', () => {
      const url = 'http://localhost:81/leadconduit_iframe.html';
      assert.deepEqual(getResponse({location: url}), expected({url: url}));
    });


    it('uses the parent location when it is present', () => {
      const host = 'yourhost';
      const url = `http://${host}:81/my_iframe.html`;
      assert.deepEqual(getResponse({parentLocation: url}), expected({url: url, domain: host}));
    });

    it('uses the cert location when parent location is an empty string', () => {
      const url = 'http://localhost:81/leadconduit_iframe.html';
      assert.deepEqual(getResponse({parentLocation: '', location: url}), expected({url: url}));
    });

    describe('scan results parsing', () => {

      it('handles null value for scans', () => {
        const response = getResponse();
        assert.equal(response.scans.found.length, 0);
      });

      it('captures scans_found', () => {
        const scanText1 = 'some disclosure text';
        let response = getResponse({scans: { found: [scanText1], not_found: [] } });
        assert.equal(response.scans.found.length, 1);
        assert.equal(response.scans.found[0], scanText1);

        const scanText2 = 'other disclosure text';
        response = getResponse({scans: { found: [scanText1, scanText2], not_found: [] } });
        assert.equal(response.scans.found.length, 2);
        assert.equal(response.scans.found[0], scanText1);
        assert.equal(response.scans.found[1], scanText2);
      });

      it('captures scans_not_found', () => {
        const response = getResponse({scans: { found: [], not_found: ['free iPod from Obama!'] } });
        assert.equal(response.scans.not_found[0], 'free iPod from Obama!');
      });

      it('sets failure outcome and reason when required scan is missing', () => {
        const vars = { trustedform: {scan_required_text: 'some disclosure text' }};
        const body = { warnings: ['string not found in snapshot'], scans: { found: [], not_found: ['some disclosure text'] } };
        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text')`);
      });

      it('correctly formats reason when multiple required scans are missing', () => {
        const vars = { trustedform: { scan_required_text: ['some disclosure text', 'other disclosure text'] }};
        const body = { warnings: ['string not found in snapshot'], scans: { found: [], not_found: ['some disclosure text', 'other disclosure text'] } };
        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Required scan text not found in TrustedForm snapshot (missing 2: 'other disclosure text, some disclosure text')`);
      });

      it('sets failure outcome and reason when forbidden scan is present', () => {
        const vars = { trustedform: { scan_forbidden_text: 'free iPod from Obama!' }};
        const body = { warnings: ['string found in snapshot'], scans: { found: ['free iPod from Obama!'], not_found: [] } };
        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')`);
      });

      it('sets failure outcome and reason when both required scan is missing and forbidden scan is present', () => {
        const vars = {
          trustedform: {
            scan_required_text: 'some disclosure text',
            scan_forbidden_text: 'free iPod from Obama!'
          }
        };
        const body = {
          warnings: ['string not found in snapshot', 'string found in snapshot'],
          scans: { found: ['free iPod from Obama!'], not_found: ['some disclosure text'] }
        };

        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text'); Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')`);
      });

      it('sets correct reason when required and forbidden text are both present', () => {
        const vars = {
          trustedform: {
            scan_required_text: 'some disclosure text',
            scan_forbidden_text: 'free iPod from Obama!'
          }
        };
        const body = {
          warnings: ['string found in snapshot'],
          scans: { found: ['free iPod from Obama!', 'some disclosure text'] }
        };

        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Forbidden scan text found in TrustedForm snapshot (found 1: 'free iPod from Obama!')`);
      });

      it('sets correct reason when neither required or forbidden text are present', () => {
        const vars = {
          trustedform: {
            scan_required_text: 'some disclosure text',
            scan_forbidden_text: 'free iPod from Obama!'
          }
        };
        const body = {
          warnings: ['string not found in snapshot'],
          scans: { not_found: ['free iPod from Obama!', 'some disclosure text'] }
        };

        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'failure');
        assert.equal(response.reason, `Required scan text not found in TrustedForm snapshot (missing 1: 'some disclosure text')`);
      });

      it('sets success outcome when required scan is present and forbidden scan is not',  () => {
        const vars = {
          trustedform: {
            scan_required_text: 'some disclosure text',
            scan_forbidden_text: 'free iPod from Obama!'
          }
        };
        const body = {
          warnings: [],
          scans: { found: ['some disclosure text'] }
        };

        const response = getResponse(body, vars);
        assert.equal(response.outcome, 'success');
        assert.equal(response.reason, null);
      });

      it('calculates age in seconds with event_duration', () => {
        const body = { event_duration: 19999 }; // 20 s
        const response = getResponse(body, {});
        // cert.created_at:  "2014-04-02T21:24:22Z"
        // claim.created_at: "2014-04-02T21:24:55Z" 33s later
        assert.equal(response.age_in_seconds, 13);  // with duration subtracted
      });

      it('calculates age in seconds without event_duration', () => {
        const body = {};
        const response = getResponse(body, {});
        // cert.created_at:  "2014-04-02T21:24:22Z"
        // claim.created_at: "2014-04-02T21:24:55Z" // 33s later
        assert.equal(response.age_in_seconds, 33);
      });

      it('time on page included when event duration present', () => {
        const body = { event_duration: 61999 };
        const response = getResponse(body, {});
        assert.equal(response.time_on_page_in_seconds, 62); // 61.999s rounded
      });
    });
  });

  describe('error response', () => {

    it('should parse it without blowing up', () => {
      const res = {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        },
        body: `<h1>This website is under heavy load</h1><p>We're sorry, too many people are accessing this website at the same time. We're working on this problem. Please try again later.</p>`
      };
      const expected = {
        outcome: 'error',
        reason:  'TrustedForm error - unable to parse response (503)'
      };
      const response = integration.response({}, {}, res);
      assert.deepEqual(response, expected);
    });


    it('returns an error when cert not found', () => {
      const res = {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        },
        body: `
          {
            "message": "certificate not found"
          }
        `
      };
      const expected = {
        outcome: 'error',
        reason:  'TrustedForm error - certificate not found (404)'
      };
      const response = integration.response({}, {}, res);
      assert.deepEqual(response, expected);
    });

    it('returns an error when unauthorized', () => {
      const res = {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        },
        body: null
      };
      const expected = {
        outcome: 'error',
        reason: 'TrustedForm error -  (401)'
      };

      const response = integration.response({}, {}, res);
      assert.deepEqual(expected, response);
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

  return JSON.stringify(response);
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
    domain: vars.domain || 'localhost',
    age_in_seconds: 33,
    time_on_page_in_seconds: null,
    created_at: '2014-04-02T21:24:22Z',
    scans: {
      found: [],
      not_found: []
    },
    duration: 0.497349
  };
};
