import { createStore } from 'vuex';
import fieldData from './fieldData';
import v4Fields from './v4fields';
import axios from 'axios';
import { castArray, get, includes, set, uniq } from 'lodash';
import { toRaw } from 'vue';

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
    filters: [],
    pageScanForbidden: [],
    pageScanRequired: [],
    advertiserName: undefined,
    shouldConfigVerify: false,
    navHistory: []
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
    },
    setPageScan(state, { required, forbidden }) {
      state.pageScanRequired = required;
      state.pageScanForbidden = forbidden;
    },
    setAdvertiserName(state, {advertiserName}) {
      state.advertiserName = advertiserName;
    },
    setShouldConfigVerify(state, shouldConfigVerify) {
      state.shouldConfigVerify = shouldConfigVerify;
    },
    setNavHistory(state, navHistory) {
      if (!includes(state.navHistory, navHistory)) {
        state.navHistory.push(navHistory);
      }
    },
    resetNavHistory(state) {
      state.navHistory = [];
    }
  },
  getters: {
    getProducts: (state) => {
      return state.products;
    },
    getErrors: (state) => {
      return state.errors;
    },
    getShouldConfigVerify: (state) => {
      return state.shouldConfigVerify;
    },
    getNavHistory: (state) => {
      return state.navHistory
    }
  },
  actions: {
    cancel (context) {
      context.state.ui.cancel();
    },
    getProducts (context) {
      return axios
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
      const rules = filterConfig.rules.map(rule => {
          return {
            op: rule.rulesOp,
            lhv: rule.lhv,
            rhv: rule.rhv
          };
        });

      const filter = {
        type: 'filter',
        reason: filterConfig.reason,
        outcome: filterConfig.outcome,
        rule_set: {
          op: 'and',
          rules
        },
        description: filterConfig.description,
        enabled: true
      };
      context.commit('setFilters', [...context.state.filters, filter]);
    },
    async confirm (context) {
      const { products, v4Fields, pageScanForbidden, pageScanRequired, advertiserName } = context.state;
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

        if (castArray(pageScanRequired).length > 0) {
          flow.steps[0].integration.mappings.push({
            property: 'trustedform.scan_required_text',
            value: toRaw(pageScanRequired)
          });
        }

        if (castArray(pageScanForbidden).length > 0) {
          flow.steps[0].integration.mappings.push({
            property: 'trustedform.scan_forbidden_text',
            value: toRaw(pageScanForbidden)
          });
        }

        if (products.verify.selected) {

          if(advertiserName) {
            flow.steps[0].integration.mappings.push({
              property: 'trustedform.advertiser_name',
              value: advertiserName
            });
          }

          const verifyRules = {
            rulesOp: 'is not equal to',
            lhv: 'trustedform.outcome',
            rhv: 'success',
          };

          const oneToOneRules = [
            { ...verifyRules },
            {
              rulesOp: 'is false',
              lhv: 'trustedform.one_to_one',
            }
          ];

          const rules = advertiserName ? oneToOneRules : [verifyRules];

          const filterConfig = {
            reason: '{{trustedform.reason}}',
            outcome: 'failure',
            description: 'Filter leads that fail on Trustedform Verify check',
            rules
          };

          await context.dispatch('createFilter', filterConfig);
        }
        context.state.filters.forEach(filter => {
          // the flow gets passed back to the app via a window.postMessage call, which clones objects passed in the message.
          // As of Vuex 4, state items are Proxy objects, which cannot be cloned, so we have to use `toRaw()`.
          flow.steps.push(toRaw(filter));
        });
      }
      context.state.ui.create({ flow });
    },
  }
});

export default initStore;
