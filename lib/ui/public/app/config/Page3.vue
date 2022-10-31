<template>
  <div>
    <header>
      Set Up TrustedForm Insights
    </header>
    <section>
      <p>
        Now you’re ready to map your fields and set up the associated filters in your LeadConduit flow.
      </p>
    </section>
    <Navigation :onFinish="finish"/>
  </div>
</template>

<script>
import { Navigation } from '@activeprospect/integration-components';

export default {
  methods: {
    finish () {
      this.$store.dispatch('finish');
    }
  },
  components: {
    Navigation
  }
};
</script>
