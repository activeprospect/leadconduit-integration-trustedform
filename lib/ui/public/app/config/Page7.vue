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
          <TextField
            v-model="advertiserName"
          ></TextField>
        </Form>
      </section>
      <Navigation
        :onConfirm="confirm"
        :disableConfirm="false"
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
        advertiserName: "",
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
/* All the selectors here use `:deep()` because otherwise the styles can't be scoped, since the classes are added by a library. */

/** override this style https://github.com/activeprospect/leadconduit-client/blob/a005d3ac5627aa39d12c64756561ef400b512bf3/public/css/core/forms.styl#L252-L254 */

:deep(.formkit-inner) {
  width: 100%;
  display: block;
  padding: 0;
}

</style>