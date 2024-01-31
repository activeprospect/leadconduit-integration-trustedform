import ui from 'leadconduit-integration-ui';
import { createApp } from 'vue';
import Config from './config/Config.vue';
import initStore from './store';
import router from './router';

function init (config) {
  const app = createApp(Config);

  app.use(initStore(config, ui));
  app.use(router);

  app.mount('#app');
}

ui.init(init);
