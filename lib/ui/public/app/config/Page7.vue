<template>
    <div>
      <header>
        Configure TrustedForm Verify
      </header>
      <section>
        <p>
          Enter the name of the legal entity for an advertiser that will be used to determine if they
          were given consent in a one to one manner.
        </p>
        <Form :actions="false">
          <input
            v-model="advertiserName"
            type="text"
            placeholder="(optional) keep empty if you don't need to check one-to-one consent"
          ></input>
        </Form>
      </section>
      <Navigation
        :onConfirm="confirm"
        :disableConfirm="false"
        :navHistory="navHistory"
      />
    </div>
  </template>
  
  <script>
  import { Navigation } from '@activeprospect/integration-components';
  import { TextField, Form } from '@activeprospect/ui-components';
  
  export default {
    components: {
      Navigation,
      TextField,
      Form
    },
    data() {
      return {
        /** @type {string} */
        advertiserName: this.$store.state.advertiserName || "",
        /** @type {string[]} */
        navHistory: this.$store.getters.getNavHistory
      };
    },
    methods: {
      confirm() {
        this.$store.commit('setAdvertiserName', {
          advertiserName: this.advertiserName
        });
        this.$store.dispatch('confirm'); 
      },
    }
  };
  </script>

<style scoped>

input {
  width: 65%;
}

</style>