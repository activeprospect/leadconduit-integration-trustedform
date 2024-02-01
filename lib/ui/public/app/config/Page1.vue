<template>
  <div>
    <header>
      Set Up TrustedForm {{ moduleName }}
    </header>
    <div v-if="isDataService">
      <section>
        <p>
          TrustedForm Insights provides lead buyers with optimized lead data that helps them assess the value of a
          lead. It helps buyers identify the leads that are most likely to convert and effectively manage returns and
          rejections. At the time of purchase, or any time thereafter, the lead buyer can use the LeadConduit platform
          to access lead metadata (not PII) found in the TrustedForm certificates.
        </p>
        <p>
          <b>Note:</b> To access TrustedForm Insights, your lead source must use the TrustedForm script on
          their lead forms.
        </p>
      </section>
      <Navigation :onConfirm="onConfirm"/>
    </div>
    <div v-else-if="!isDataService">
      <LoadingScreen :onFinish="() => {/* NOOP */}" :module-name="'TrustedForm ' + moduleName"/>
    </div>
  </div>
</template>

<script>
import { LoadingScreen, Navigation } from '@activeprospect/integration-components';

export default {
  data () {
    return {
      isDataService: true
    };
  },
  components: {
    LoadingScreen, Navigation
  },
  computed: {
    moduleName () {
      switch (this.$store.state.config.integration) {
        case 'leadconduit-trustedform.outbound.claim':
          return 'Claim';
        case 'leadconduit-trustedform.outbound.consent':
          return 'Consent';
        case 'leadconduit-trustedform.outbound.consent_plus_data':
          return 'Consent + Insights';
        case 'leadconduit-trustedform.outbound.insights':
          return 'Insights';
        default:
          return '';
      }
    }
  },
  methods: {
    onConfirm () {
      this.$router.push('/2');
    }
  },
  mounted () {
    const { integration } = this.$store.state.config;
    if (integration.includes('outbound.trustedform')) this.$router.push('/4');
    if (!integration.includes('insights')) {
      this.isDataService = false;
    }
  }
};
</script>
