<template>
  <div>
    <header>
      Add TrustedForm Add-On
    </header>
    <section v-if="loading">
      <span class="loading"></span> Loading products...
    </section>
    <section v-else-if="!productsAvailable">
      <p>
        Your account does not have access to TrustedForm. Please contact
        <a href="mailto:support@activeprospect.com" target="_blank">support@activeprospect.com</a>
        if this is in error or if you would like to add TrustedForm to your account.
      </p>
    </section>
    <section v-else>
      <form>
        <h3>Select the TrustedForm products to add to your flow.</h3>
        <p>You may select all products that you would like to add to your flow. Each product will be charged depending on your contract. {{errors}}</p>
        <ul>
          <li>
            <label>
              <input type="checkbox" class="fancy-checkbox" :disabled="!products.retain.enabled" v-model="products.retain.selected" id="retain"><label for="retain">Retain</label>
              <p class="help-text">Store consent in TrustedForm certificates for legal (TCPA) compliance.</p>
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" class="fancy-checkbox" :disabled="!products.insights.enabled" v-model="products.insights.selected" id="insights"><label for="insights">Insights</label>
              <p class="help-text">TrustedForm Insights helps buyers identify the leads that are most likely to convert and effectively manage returns and rejections.</p>
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" class="fancy-checkbox" :disabled="!products.verify.enabled" v-model="products.verify.selected" id="verify"><label for="verify">Verify</label>
              <p class="help-text">Confirm that your leads were shown consent language that meets your compliance requirements.</p>
            </label>
          </li>
        </ul>
      </form>
    </section>
    <Navigation
      :showPrevious="false"
      :onConfirm="confirm"
      :disableConfirm="!products.retain.selected && !products.insights.selected && !products.verify.selected"
      :navHistory="navHistory"
    />
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components';

export default {
  data () {
    return {
      loading: true,
      products: this.$store.getters.getProducts,
      errors: this.$store.getters.getErrors,
      navHistory: this.$store.getters.getNavHistory
    };
  },
  components: {
    Navigation
  },
  computed: {
    productsAvailable() {
      return this.products.retain.enabled || this.products.insights.enabled || this.products.verify.enabled;
    }
  },
  methods: {
    confirm () {
      this.$store.commit('resetNavHistory');
      this.$store.commit('setNavHistory', '/4');
      this.$store.state.products = this.products;
      if (this.products.insights.selected && this.products.verify.selected) {
        this.$router.push('/5'); 
        this.$store.commit('setShouldConfigVerify', true);
      } else if (this.products.insights.selected) {
        this.$store.commit('setShouldConfigVerify', false);
        this.$router.push('/5');
      } else if (this.products.verify.selected) {
        this.$router.push('/7');
      } else {
        this.$store.dispatch('confirm');
      }
    }
  },
  async created () {
    await this.$store.dispatch('getProducts');
    this.loading = false;
  }
};
</script>

<style scoped>
ul {
  padding-top: 1em;
}
</style>