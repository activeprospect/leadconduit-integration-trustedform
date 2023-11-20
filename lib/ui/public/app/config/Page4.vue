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
            <input type="checkbox" :disabled="!products.retain.enabled" v-model="products.retain.selected"><span> Retain</span>
            <p class="help-text">Store consent in TrustedForm certificates for legal (TCPA) compliance.</p>
          </li>
          <li>
            <input type="checkbox" :disabled="!products.insights.enabled" v-model="products.insights.selected"><span> Insights</span>
            <p class="help-text">TrustedForm Insights helps buyers identify the leads that are most likely to convert and effectively manage returns and rejections.</p>
          </li>
          <li>
            <input type="checkbox" :disabled="!products.verify.enabled" v-model="products.verify.selected"><span> Verify</span>
            <p class="help-text">Confirm that your leads were shown consent language that meets your compliance requirements.</p>
          </li>
        </ul>
      </form>
    </section>
    <Navigation
      :showPrevious="false"
      :onNext="!showFinish ? next : undefined"
      :onFinish="showFinish ? finish : undefined"
      :disableNext="!products.retain.selected && !products.insights.selected && !products.verify.selected"
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
  computed: {
    showFinish () {
      return (this.products.retain.selected ||this.products.verify.selected ) && !this.products.insights.selected;
    }
  },
  methods: {
    next () {
      this.$store.state.products = this.products;
      this.$router.push('/5');
    },
    finish () {
      this.$store.state.products = this.products;
      this.$store.dispatch('finish');
    }
  },
  created () {
    this.$store.dispatch('getProducts');
  }
};
</script>
