import { createMemoryHistory, createRouter } from 'vue-router';
import Config from './config/Config.vue';
import PageOne from './config/Page1.vue';
import PageTwo from './config/Page2.vue';
import PageThree from './config/Page3.vue';
import PageFour from './config/Page4.vue';
import PageFive from './config/Page5.vue';
import PageSix from './config/Page6.vue';
import PageSeven from './config/Page7.vue';

export default createRouter({
  history: createMemoryHistory(),
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
        },
        {
          path: '4',
          name: 'PageFour',
          component: PageFour
        },
        {
          path: '5',
          name: 'PageFive',
          component: PageFive
        },
        {
          path: '6',
          name: 'PageSix',
          component: PageSix
        },
        {
          path: '7',
          name: 'PageSeven',
          component: PageSeven
        }
      ]
    }
  ]
});
