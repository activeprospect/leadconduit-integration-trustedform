module.exports = {
  ui: require('./lib/ui'),
  outbound: {
    claim: require('./lib/claim'),
    data_service: require('./lib/data_service')
  }
};
