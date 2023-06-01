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
        </ul>
        <p v-if="this.$store.getters.getErrors" class="warning">{{this.$store.getters.getErrors}}</p>
      </form>
    </section>
    <Navigation
      :showPrevious="false"
      :onNext="!showFinish ? next : undefined"
      :onFinish="showFinish ? finish : undefined"
      :disableNext="!products.retain.selected && !products.insights.selected"
    />
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components'

export default {
  data () {
    return {
      products: {
        retain: { enabled: true, selected: false },
        insights: { enabled: true, selected: false }
      },
      errors: this.$store.getters.getErrors
    };
  },
  components: {
    Navigation
  },
  computed: {
    showFinish () {
      return this.products.retain.selected && !this.products.insights.selected;
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
    this.$store.dispatch('getProducts')
  }
};
</script>
