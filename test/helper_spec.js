const assert = require('chai').assert;
const helper = require('../lib/helpers');

describe('Helper functions', () => {

  describe('Fingerprinting', () => {

    it('should set summary to all matching', () => {
      const actual = helper.evalFingerprint({}, { matching: ['abc'], non_matching: [] });
      assert.equal(actual.fingerprints_summary, 'All Matched');
    });

    it('should set summary to some matching', () => {
      const actual = helper.evalFingerprint({}, { matching: ['abc'], non_matching: ['def'] });
      assert.equal(actual.fingerprints_summary, 'Some Matched');
    });

    it('should set summary to none matching', () => {
      const actual = helper.evalFingerprint({}, { matching: [], non_matching: ['def'] });
      assert.equal(actual.fingerprints_summary, 'None Matched');
    });

    it('should set summary to no data', () => {
      const actual = helper.evalFingerprint({}, { matching: [], non_matching: [] });
      assert.equal(actual.fingerprints_summary, 'No Fingerprinting Data');
    });

    it('should set matched flag for email', () => {
      const fingerprints = { matching: ['c4a8e7fe184993964ae81380e91579015306838a'], non_matching: [] };
      const actual = helper.evalFingerprint({ email: 'kelly@thethings.biz' }, fingerprints);
      assert.isTrue(actual.email_fingerprint_matched);
      assert.isUndefined(actual.phone_1_fingerprint_matched);
      assert.isUndefined(actual.phone_2_fingerprint_matched);
      assert.isUndefined(actual.phone_3_fingerprint_matched);
    });

    it('should set matched flag for phone_1', () => {
      const fingerprints = { matching: ['d511850d569bcd7802c30f54de34bb9f2b31eede'], non_matching: [] };
      const actual = helper.evalFingerprint({ phone_1: '5135556719' }, fingerprints);
      assert.isUndefined(actual.email_fingerprint_matched);
      assert.isTrue(actual.phone_1_fingerprint_matched);
      assert.isUndefined(actual.phone_2_fingerprint_matched);
      assert.isUndefined(actual.phone_3_fingerprint_matched);
    });

    it('should match one and not match another', () => {
      const fingerprints = { matching: ['c4a8e7fe184993964ae81380e91579015306838a'], non_matching: ['thiswillnotmatchsorry'] };
      const actual = helper.evalFingerprint({ email: 'kelly@thethings.biz',  phone_1: '5135556719' }, fingerprints);
      assert.isTrue(actual.email_fingerprint_matched);
      assert.isFalse(actual.phone_1_fingerprint_matched);
      assert.isUndefined(actual.phone_2_fingerprint_matched);
      assert.isUndefined(actual.phone_3_fingerprint_matched);
    });
  })

});
