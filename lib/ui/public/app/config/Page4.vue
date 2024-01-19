<template>
  <div>
    <header>
      Add TrustedForm Add-On
    </header>
    <section>
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
    />
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components';

export default {
  data () {
    return {
      products: this.$store.getters.getProducts,
      errors: this.$store.getters.getErrors
    };
  },
  components: {
    Navigation
  },
  methods: {
    confirm () {
      this.$store.state.products = this.products;
      if (this.products.insights.selected) {
        this.$router.push('/5');
      } else {
        this.$store.dispatch('confirm');
      }
    }
  },
  created () {
    this.$store.dispatch('getProducts');
  }
};
</script>

<style scoped>
ul {
  padding-top: 1em;
}
</style>