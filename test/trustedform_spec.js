const assert = require('chai').assert;
const integration = require('../lib/trustedform');
const parser = require('leadconduit-integration').test.types.parser(integration.request.variables());
const {merge} = require('lodash');

describe('v4', () => {

  describe('Validate', () => {
    it('should pass when all required fields are present', () => {
      assert.isUndefined(integration.validate(baseVars()));
    });

    it('should pass when verify product is not present', () => {
      const vars = baseVars();
      delete vars.trustedform.verify;
      assert.isUndefined(integration.validate(vars));
    });


    it('should require that a trustedform product is selected', () => {
      assert.equal(integration.validate(baseVars({
        trustedform: {
          retain: false,
          insights: false,
          verify: false
        }
      })), 'a TrustedForm product must be selected');
    });

    it('should require an email or phone number if retain is selected', () => {
      let vars = baseVars({lead: {email: null, phone_1: null}});
      assert.equal(integration.validate(vars), 'an email address or phone number is required to use TrustedForm Retain');
      vars = baseVars({lead: {phone_1: null}});
      assert.isUndefined(integration.validate(vars));
      vars = baseVars({lead: {email: null}});
      assert.isUndefined(integration.validate(vars));
    });

    describe('When Insights is enabled', () => {
      it('should require at least one property selected', () => {
        let vars = baseVars({
          trustedform: { retain: 'false', verify: 'false' },
          insights: { age: 'false', domain: 'false', location: 'false'}}
        );
        assert.equal(integration.validate(vars), 'no properties selected for TrustedForm Insights');
      });

      it('should skip when insights vars are not defined', () => {
        const vars = baseVars();
        delete vars.insights;
        assert.equal(integration.validate(vars), 'no properties selected for TrustedForm Insights');
      });

      it('should skip when no insights properties are present', () => {
        const vars = {
          lead: {
            trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
          },
          trustedform: {
            insights: 'true',
          },
          insights: {}
        };
        assert.equal(integration.validate(parser(vars)), 'no properties selected for TrustedForm Insights');
      });

      it('should skip if page_scan is false and no other insights properties are present ', () => {
        const vars = {
          lead: {
            trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
          },
          trustedform: {
            insights: 'true',
          },
          insights: {
            page_scan: 'false'
          }
        };
        assert.equal(integration.validate(parser(vars)), 'no properties selected for TrustedForm Insights');
      });

      it('should pass when page_scan is true ', () => {
        const vars = {
          lead: {
            trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
          },
          trustedform: {
            insights: 'true',
          },
          insights: {
            page_scan: 'true'
          }
        };
        assert.isUndefined(integration.validate(parser(vars)));
      });

      it('should pass when page_scan is false but other insights properties are present ', () => {
        const vars = baseVars({ insights: { page_scan: 'false' } });
        assert.isUndefined(integration.validate(vars));
      });
    });
  });

  describe('request', () => {
    it('should correctly format a request with all queries (insights, retain and verify)', () => {
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
            properties: [
              'age_seconds',
              'approx_ip_geo',
              'browser',
              'created_at',
              'domain',
              'expires_at',
              'form_input_kpm',
              'form_input_method',
              'form_input_wpm',
              'ip',
              'is_framed',
              'is_masked',
              'num_sensitive_content_elements',
              'num_sensitive_form_elements',
              'os',
              'page_url',
              'parent_page_url',
              'seconds_on_page',
              'bot_detected'
            ]
          },
          verify: {
            advertiser_name: 'test'
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'api-version': '4.0',
          Authorization: 'Basic WDoxMjM0'
        }
      };
      const vars = baseVars({
        insights: {
          browser: 'true',
          created_timestamp: 'true',
          expiration_timestamp: 'true',
          framed: 'true',
          form_input_method: 'true',
          form_input_kpm: 'true',
          form_input_wpm: 'true',
          ip_address: 'true',
          masked: 'true',
          sensitive_content: 'true',
          sensitive_form_fields: 'true',
          operating_system: 'true',
          page_url: 'true',
          parent_page_url: 'true',
          time_on_page: 'true',
          bot_detected: 'true'
        },
        trustedform: { advertiser_name: 'test' }
      });
      assert.deepEqual(integration.request(vars), expected);
    });
    it('should default the scan delimiter to "|" if not provided', () => {
      const expected = JSON.stringify({
        insights: {
          properties: ['age_seconds','approx_ip_geo','domain'],
          scans: {
            required: 'I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.',
            forbidden: undefined,
            delimiter: '|'
          }
        }
      });
      const vars = baseVars({
        trustedform: {
          retain: 'false',
          verify: 'false',
          scan_required_text: 'I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.'
        },
        insights: {
          page_scan: 'true'
        }
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
    it('should use specifed delimiter if mapped', () => {
      const expected = JSON.stringify({
        insights: {
          properties: ['age_seconds','approx_ip_geo','domain'],
          scans: {
            required: 'I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.',
            forbidden: undefined,
            delimiter: '/'
          }
        }
      });
      const vars = baseVars({
        trustedform: {
          retain: 'false',
          verify: 'false',
          scan_required_text: 'I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.',
          scan_delimiter: '/'
        },
        insights: {
          page_scan: 'true'
        }
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
    it('should correctly format a request with only insights and retain', () => {
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
            properties: [
              'age_seconds',
              'approx_ip_geo',
              'browser',
              'created_at',
              'domain',
              'expires_at',
              'form_input_kpm',
              'form_input_method',
              'form_input_wpm',
              'ip',
              'is_framed',
              'is_masked',
              'num_sensitive_content_elements',
              'num_sensitive_form_elements',
              'os',
              'page_url',
              'parent_page_url',
              'seconds_on_page',
              'bot_detected'
            ]
          }
        }),
        headers: {
          'Content-Type': 'application/json',
          'api-version': '4.0',
          Authorization: 'Basic WDoxMjM0'
        }
      };
      const vars = baseVars({
        insights: {
          browser: 'true',
          created_timestamp: 'true',
          expiration_timestamp: 'true',
          framed: 'true',
          form_input_method: 'true',
          form_input_kpm: 'true',
          form_input_wpm: 'true',
          ip_address: 'true',
          masked: 'true',
          sensitive_content: 'true',
          sensitive_form_fields: 'true',
          operating_system: 'true',
          page_url: 'true',
          parent_page_url: 'true',
          time_on_page: 'true',
          bot_detected: 'true'
        }
      });
      delete vars.trustedform.verify;
      assert.deepEqual(integration.request(vars), expected);
    });
    it('should correctly format a retain only request', () => {
      const expected = JSON.stringify({
        match_lead: {
          email: 'test@activeprospect.com',
          phone: '5122981234'
        },
        retain: {
          reference: '9876',
          vendor: 'ABC, Inc.'
        }
      });
      const vars = baseVars({
        trustedform: {
          insights: 'false',
          verify: 'false',
          vendor: 'ABC, Inc.',
          custom_reference: '9876'
        }
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
    it('should correctly format an insights only request', () => {
      const expected = JSON.stringify({
        insights: {
          properties: ['age_seconds', 'approx_ip_geo', 'domain'],
          scans: {
            required: 'click here!',
            forbidden: undefined,
            delimiter: '|'
          }
        }
      });
      const vars = baseVars({
        trustedform: {
          retain: 'false',
          verify: 'false',
          scan_required_text: 'click here!'
        },
        insights: {
          page_scan: 'true'
        }
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
    it('should correctly format a verify only request', () => {
      const expected = JSON.stringify({
        verify: {}
      });
      const vars = baseVars({
        trustedform: {
          retain: 'false',
          insights: 'false'
        }
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
    it('should correctly format a verify only request with 1:1 consent check', () => {
      const expected = JSON.stringify({
        verify: {
          advertiser_name: 'test'
        }
      });
      const vars = baseVars({
        trustedform: {
          retain: 'false',
          insights: 'false',
          advertiser_name: 'test'
        },
        verify: {}
      });
      assert.deepEqual(integration.request(vars).body, expected);
    });
  });

  it('should use a custom api key when present', () => {
    const expected = `Basic ${Buffer.from('X:abcd').toString('base64')}`;
    const vars = baseVars({
      trustedform: {
        api_key: 'abcd'
      }
    });
    assert.equal(integration.request(vars).headers.Authorization, expected);
  });

  describe('response', () => {
    it('should correctly handle a success response', () => {
      const res = {
        status: 200,
        body: JSON.stringify({
          insights: {
            properties: {
              age_seconds: 91430,
              approx_ip_geo: {
                city: 'Austin',
                country_code: 'US',
                lat: 30.2627,
                lon: -97.7467,
                postal_code: '78713',
                state: 'Texas',
                time_zone: 'America/Chicago'
              },
              browser: {
                full: 'Firefox 112.0.',
                name: 'Firefox',
                version: {
                  full: '112.0.',
                  major: '112',
                  minor: '0',
                  patch: ""
                }
              },
              created_at: '2023-05-31T20:43:31Z',
              domain: 'activeprospect.github.io',
              expires_at: '2023-09-01T20:43:31Z',
              form_input_kpm: 212.38938053097348,
              ip: '24.28.104.159',
              is_framed: false,
              is_masked: false,
              num_sensitive_content_elements: 0,
              num_sensitive_form_elements: 0,
              os: {
                full: 'Mac OS X 10.15',
                is_mobile: false,
                name: 'Mac OS X',
                version: {
                  full: '10.15',
                  major: '10',
                  minor: '15',
                  patch: null
                }
              },
              page_url: 'https://activeprospect.github.io/certificate_staging.html',
              parent_page_url: null,
              seconds_on_page: 8374,
              bot_detected: false
            },
            scans: {
              forbidden: [],
              required: [
                'make a claim on Staging'
              ],
              result: {
                forbidden: {
                  found: [],
                  not_found: []
                },
                required: {
                  found: [
                    'make a claim on Staging'
                  ],
                  not_found: []
                },
                success: true
              }
            }
          },
          match_lead: {
            email: 'superman@activeprospect.com',
            result: {
              email_match: true,
              phone_match: false,
              success: true
            }
          },
          outcome: 'success',
          reason: null,
          retain: {
            reference: 'https://app.leadconduit-development.com/events/647916a0d2c7c9de31fffd13',
            results: {
              expires_at: '2023-08-29T20:43:31Z',
              previously_retained: true,
              masked_cert_url: 'https://cert.trustedform-dev.com/f1fd052c43f08078a37d840b243daa69a35e8eda',
              share_url: 'https://cert.trustedform-dev.com/1eb8608bdf5b3bc42bb1e33cb0ed57a4bab643ef?shared_token=k6Kw261Tc-55fSPY2_xwPAkSm5r6V2w5h5CggqL2A_f-cph2gXWOonRmV-7aCe8ktjV2acrGQMujmZYPWHgBDd4AEAIeiMeEeqv-Rk8.ISm5ttdJP0FP5wGWyo6O7A.mc_8jwgGZpVBCRsDm0hHgg'
            },
            vendor: 'Inbound Verbose'
          },
          verify: {
              languages: [
              {
                text: 'I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.'
              }
            ],
            result: {
              language_approved: true,
              success: true,
              form_submitted: true,
              one_to_one: true,
              min_font_size_px_satisfied: true,
              min_contrast_ratio_satisfied: true
            }
          }
        })
      };
      const expected = {
        age_in_seconds: 91430,
        amount_forbidden_matched: 'none',
        amount_required_matched: 'all',
        browser_full: 'Firefox 112.0.',
        city: 'Austin',
        country_code: 'US',
        created_at: '2023-05-31T20:43:31Z',
        domain: 'activeprospect.github.io',
        email_fingerprint_matched: true,
        expires_at: '2023-08-29T20:43:31Z',
        forbidden_scans_found: [],
        forbidden_scans_not_found: [],
        ip: '24.28.104.159',
        is_framed: false,
        is_masked: false,
        is_mobile: false,
        kpm: 212.38938053097348,
        latitude: 30.2627,
        longitude: -97.7467,
        masked_cert_url: 'https://cert.trustedform-dev.com/f1fd052c43f08078a37d840b243daa69a35e8eda',
        share_url: 'https://cert.trustedform-dev.com/1eb8608bdf5b3bc42bb1e33cb0ed57a4bab643ef?shared_token=k6Kw261Tc-55fSPY2_xwPAkSm5r6V2w5h5CggqL2A_f-cph2gXWOonRmV-7aCe8ktjV2acrGQMujmZYPWHgBDd4AEAIeiMeEeqv-Rk8.ISm5ttdJP0FP5wGWyo6O7A.mc_8jwgGZpVBCRsDm0hHgg',
        matched_email: 'superman@activeprospect.com',
        os_full: 'Mac OS X 10.15',
        os_name: 'Mac OS X',
        outcome: 'success',
        page_url: 'https://activeprospect.github.io/certificate_staging.html',
        parent_page_url: null,
        phone_fingerprint_matched: false,
        postal_code: '78713',
        previously_retained: true,
        reason: null,
        reference_code: 'https://app.leadconduit-development.com/events/647916a0d2c7c9de31fffd13',
        required_scans_found: [ 'make a claim on Staging' ],
        required_scans_not_found: [],
        scans_result: true,
        sensitive_hidden_content_elements: 0,
        sensitive_hidden_form_elements: 0,
        state: 'Texas',
        successful_match: true,
        time_on_page_in_seconds: 8374,
        time_zone: 'America/Chicago',
        vendor: 'Inbound Verbose',
        bot_detected: false,
        one_to_one: true,
        verify: {
          languages: ['I understand that the TrustedForm certificate is sent to the email address I provided above and I will receive product updates as they are released.'],
          language_approved: true,
          form_submitted: true,
          success: true,
          min_font_size_px_satisfied: true,
          min_contrast_ratio_satisfied: true
        }
      };
      assert.deepEqual(integration.response({ insights: { page_scan: true }}, {}, res), expected);
    });

    it('should correctly handle a failure responses', () => {
      const res = {
        status: 200,
        body: JSON.stringify({
          insights: {
            scans: {
              forbidden: [],
              required: [
                'make a claim on Production'
              ],
              result: {
                forbidden: {
                  found: [],
                  not_found: []
                },
                required: {
                  found: [],
                  not_found: [
                    'make a claim on Production'
                  ]
                },
                success: false
              }
            }
          },
          outcome: 'failure',
          reason: 'Insights page scans unsuccessful'
        })
      };
      const expected = {
        outcome: 'failure',
        reason: 'Insights page scans unsuccessful',
        amount_required_matched: 'none',
        amount_forbidden_matched: 'none',
        forbidden_scans_found: [],
        forbidden_scans_not_found: [],
        required_scans_found: [],
        required_scans_not_found: [ 'make a claim on Production' ],
        scans_result: false
      };
      assert.deepEqual(integration.response({ insights: { page_scan: true }}, {}, res), expected);
    });

    it('should correctly handle a Verify Consent language failure responses', () => {
      const res = {
        status: 200,
        body: JSON.stringify({
          'verify': {
            'languages': [{'text': 'By clicking on the "Get Rates" button below, I consent to be contacted'}],
            'result': {
            'language_approved': false,
            'success': false
            }
          },
          outcome: 'failure',
          reason: 'Consent language not detected in the certificate.'
        })
      };
      const expected = {
        verify: {
          languages: ['By clicking on the "Get Rates" button below, I consent to be contacted'],
          language_approved: false,
          success: false
        },
        outcome: 'failure',
        reason: 'Consent language not detected in the certificate.',
      };
      assert.deepEqual(integration.response({}, {}, res), expected);
    });

    it('should correctly handle an error response', () => {
      const res = {
        status: 500,
        body: 'unable to access server'
      };
      const expected = {
        outcome: 'error',
        reason: 'unable to parse response'
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
      trustedform_cert_url: 'https://cert.trustedform.com/2605ec3a321e1b3a41addf0bba1213505ef57985',
      id: '4567'
    },
    trustedform: {
      retain: 'true',
      insights: 'true',
      verify: 'true'
    },
    insights: {
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
