<template>
  <div>
    <header>
      Set Up TrustedForm {{ moduleName }}
    </header>
    <div v-if="isDataService">
      <section>
        <p>
          TrustedForm Data Service provides lead buyers with optimized lead data that helps them assess the value of a
          lead. It helps buyers identify the leads that are most likely to convert and effectively manage returns and
          rejections. At the time of purchase, or any time thereafter, the lead buyer can use the LeadConduit platform
          to access lead metadata (not PII) found in the TrustedForm certificates.
        </p>
        <p>
          <b>Note:</b> To access TrustedForm Data Service data, your lead source must use the TrustedForm script on
          their lead forms.
        </p>
      </section>
      <Navigation :onNext="onNext"/>
    </div>
    <div v-else-if="!isDataService">
      <LoadingScreen :module-name="moduleName" :finish="onFinish"/>
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
        case 'leadconduit-trustedform.outbound.data_service':
          return 'Data Service';
        default:
          return '';
      }
    }
  },
  methods: {
    onNext () {
      this.$router.push('/2');
    },
    onFinish () {
      this.$store.dispatch('finish');
    }
  },
  mounted () {
    const { integration } = this.$store.state.config;
    if (!integration.includes('data_service')) {
      this.isDataService = false;
    }
  }
};
</script>
