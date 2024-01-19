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
    <Navigation :onConfirm="confirm"/>
  </div>
</template>

<script>
import { Navigation } from '@activeprospect/integration-components';

export default {
  methods: {
    confirm () {
      this.$store.dispatch('confirm');
    }
  },
  components: {
    Navigation
  }
};
</script>
