import Vuex from 'vuex';
import fieldData from './fieldData';

const initStore = (config, ui) => new Vuex.Store({
  state: {
    // field descriptions
    fieldData,

    // integration state
    ui,
    config
  },
  actions: {
    cancel (context) {
      context.state.ui.cancel();
    },
    finish (context) {
      const flow = {
        steps: [{
          type: 'recipient',
          entity: {
            name: config.entity.name,
            id: config.entity.id
          },
          integration: {
            module_id: config.integration,
            mappings: []
          }
        }]
      };
      context.state.ui.create({ flow });
    }
  }
});

export default initStore;
