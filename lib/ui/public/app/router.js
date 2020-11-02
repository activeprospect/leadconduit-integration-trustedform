import Vue from 'vue';
import Router from 'vue-router';
import Config from './config/Config.vue';
import PageOne from './config/PageOne.vue';
import PageTwo from './config/PageTwo.vue';
import PageThree from './config/PageThree.vue';

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
          component: PageOne,
        },
        {
          path: '2',
          name: 'PageTwo',
          component: PageTwo,
        },
        {
          path: '3',
          name: 'PageThree',
          component: PageThree,
        }
      ],
    },
  ],
});
