<template>
  <div v-if="!isClaim">
    <header>
      Set Up TrustedForm Data Service
    </header>
    <section>
      <p>
        TrustedForm Data Service provides lead buyers with optimized lead data that helps them assess the value of a lead. It helps buyers identify the leads that are most likely to convert and effectively manage returns and rejections.  At the time of purchase, or any time thereafter, the lead buyer can use the LeadConduit platform to access lead metadata (not PII) found in the TrustedForm certificates.
      </p>
      <p>
        <b>Note:</b> To access TrustedForm Data Service data, your lead source must use the TrustedForm script on their lead forms.
      </p>
    </section>
    <Navigation/>
  </div>
  <div v-else-if="isClaim">
    <header>
      TrustedForm Claim
    </header>
    <section>
      <span class="loading"></span> We're setting up your TrustedForm step now.
    </section>
    <Navigation :show-next="false"/>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue';

export default {
  data() {
    return {
      isClaim: false,
    };
  },
  components: {
    Navigation
  },
  mounted() {
    // if TrustedForm Claim integration is selected, wait 2 seconds and create flow
    // This prevents the modal from rapidly opening and slamming closed,
    // which is a jarring experience

    const { integration } = this.$store.state.config;
    if (integration.includes('claim')) {
      this.isClaim = true;
      setTimeout(() => {
        this.$store.dispatch('finish');
      }, 2000);
    }
  },
};
</script>
