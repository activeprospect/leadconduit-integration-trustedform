module.exports = {
  ui: require('./lib/ui'),
  outbound: {
    claim: require('./lib/claim'),
    consent: require('./lib/consent'),
    consent_plus_insights: require('./lib/consent_plus_insights'),
    data_service: require('./lib/data_service'),
    decision_service_ping: require('./lib/data_service'),
    decision_service_post: require('./lib/data_service')
  }
};
