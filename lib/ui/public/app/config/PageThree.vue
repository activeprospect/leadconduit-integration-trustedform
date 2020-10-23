<template>
  <div>
    <header>
      Set Up TrustedForm Data Service
    </header>
    <section>
      <p>
        Now you’re ready to map your fields and set up the associated filters in your LeadConduit flow.
      </p>
    </section>
    <Navigation :show-next="false">
      <template v-slot:footer>
        <button @click="finish" class="primary">Finish</button>
      </template>
    </Navigation>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue';

export default {
  methods: {
    finish() {
      this.$store.dispatch('finish');
    },
  },
  components: {
    Navigation
  },
};
</script>
