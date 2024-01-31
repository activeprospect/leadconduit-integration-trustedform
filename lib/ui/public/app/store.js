import { createStore } from 'vuex';
import fieldData from './fieldData';
import v4Fields from './v4fields';
import axios from 'axios';
import { get } from 'lodash';

const initStore = (config, ui) => createStore({
  state: {
    // field descriptions
    fieldData,
    v4Fields,

    // integration state
    ui,
    config,
    errors: undefined,
    products: {
      retain: { enabled: false, selected: false },
      insights: { enabled: false, selected: false },
      verify: { enabled: false, selected: false }
    },
    filters: []
  },
  mutations: {
    setErrors (state, errors) {
      state.errors = errors;
    },
    setProduct (state, { product, value }) {
      state.products[product] = value;
    },
    setFilters(state, filters) {
      state.filters = filters;
    }
  },
  getters: {
    getProducts: (state) => {
      return state.products;
    },
    getErrors: (state) => {
      return state.errors;
    }
  },
  actions: {
    cancel (context) {
      context.state.ui.cancel();
    },
    getProducts (context) {
      axios
        .get(`account?apiKey=${config.credential.token}`)
        .then(function (response) {
          const availableProducts = [
            'retain',
            'insights',
            'verify'
          ];
          const products =  get(response, 'data.product_components');
          availableProducts.forEach(function (product) {
            context.commit('setProduct', { product, value: {
              enabled: products.includes(product),
              selected: false
            }});
          });
        })
        .catch(function (error) {
          if (get(error, 'response.status') === 401) {
            context.commit('setErrors', 'no TrustedForm account found for this API key');
          } else {
            context.commit('setErrors', get(error, 'response.data') || error.message);
          }
        });
    },
    createFilter(context, filterConfig) {
      const filter = {
        type: 'filter',
        reason: filterConfig.reason,
        outcome: filterConfig.outcome,
        rule_set: {
          op: 'and',
          rules: [{
            op: filterConfig.rulesOp,
            lhv: filterConfig.lhv,
            rhv: filterConfig.rhv
          }]
        },
        description: filterConfig.description,
        enabled: true
      };
      context.commit('setFilters', [...context.state.filters, filter]);
    },
    async confirm (context) {
      const { products, v4Fields } = context.state;
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
        }],
      };
      
      if (config.integration === 'leadconduit-trustedform.outbound.trustedform') {
        Object.keys(products).forEach((product) => {
          flow.steps[0].integration.mappings.push({
            property: `trustedform.${product}`,
            value: products[product].selected ? 'true' : 'false'
          });
        });

        if (products.insights.selected) {
          Object.keys(v4Fields).forEach((field) => {
            flow.steps[0].integration.mappings.push({
              property: `insights.${field}`,
              value: v4Fields[field].selected ? 'true' : 'false'
            });
          });
        }

        if (products.verify.selected) {
          const filterConfig = {
            reason: '{{trustedform.reason}}',
            rulesOp: 'is not equal to',
            lhv: 'trustedform.outcome',
            rhv: 'success',
            outcome: 'failure',
            description: 'Filter leads that fail on Trustedform Verify check'
          };
          await context.dispatch('createFilter', filterConfig);
        }
        context.state.filters.forEach(filter => {
          flow.steps.push(filter);
        });      
      }
      context.state.ui.create({ flow });
    }
  }
});

export default initStore;
