module.exports = {
  ui: require('./lib/ui'),
  outbound: {
    claim: require('./lib/claim'),
    consent: require('./lib/consent'),
    consent_plus_data: require('./lib/consent_plus_data'),
    decision_service_ping: require('./lib/insights'),
    decision_service_post: require('./lib/insights'),
    insights: require('./lib/insights')
  }
};
