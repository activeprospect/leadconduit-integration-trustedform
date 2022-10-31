module.exports = {
  ui: require('./lib/ui'),
  outbound: {
    claim: require('./lib/claim'),
    consent: require('./lib/consent'),
    consent_plus_data: require('./lib/consent_plus_data'),
    data_service: require('./lib/data_service'),
    decision_service_ping: require('./lib/data_service'),
    decision_service_post: require('./lib/data_service'),
    insights: require('./lib/insights')
  }
};
