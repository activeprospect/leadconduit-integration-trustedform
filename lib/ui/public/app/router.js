import Vue from 'vue';
import Router from 'vue-router';
import Config from './config/Config.vue';
import PageOne from './config/Page1.vue';
import PageTwo from './config/Page2.vue';
import PageThree from './config/Page3.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Default',
      component: Config,
      children: [
        {
          path: '',
          alias: '1',
          name: 'PageOne',
          component: PageOne
        },
        {
          path: '2',
          name: 'PageTwo',
          component: PageTwo
        },
        {
          path: '3',
          name: 'PageThree',
          component: PageThree
        }
      ]
    }
  ]
});
