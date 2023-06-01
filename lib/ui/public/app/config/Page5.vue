<template>
  <div>
    <header>
      TrustedForm Insights Configuration
    </header>
    <section>
      <form>
        <h3>Select Data Points</h3>
        <p>TrustedForm Insights provides the following data related to the lead that filled out the form. Each selection of data points will be charged individually.</p>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="headerCheckbox" @click="toggleAllFields(amountSelected === 'none')"></th>
              <th>Select All</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in fields">
              <td><input type="checkbox" v-model="field.selected" @click="updateHeader()"></td>
              <td>{{field.name}}</td>
              <td v-html="field.description"></td>
            </tr>
          </tbody>
        </table>
      </form>
    </section>
    <Navigation
      :onFinish="finish"
      :disableFinish="amountSelected === 'none'"
    />
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components'
import { filter } from 'lodash';

export default {
  data () {
    return {
      fields: this.$store.state.v4Fields
    };
  },
  components: {
    Navigation
  },
  computed: {
    amountSelected () {
      // 'some', 'all', or 'none'
      const totalFields = Object.keys(this.fields).length;
      const selectedFields = filter(this.fields, function (field) { return field.selected; }).length;
      if (selectedFields === 0) return 'none';
      if (totalFields === selectedFields) return 'all';
      return 'some';
    }
  },
  methods: {
    toggleAllFields (bool) {
      for (const field in this.fields) {
        this.fields[field].selected = bool;
      }
      this.updateHeader();
    },
    updateHeader () {
      const checkbox = document.querySelector('#headerCheckbox');
      checkbox.checked = this.amountSelected === 'all';
      checkbox.indeterminate = this.amountSelected === 'some';
    },
    finish () {
      this.$store.state.v4Fields = this.fields;
      this.$store.dispatch('finish');
    }
  }
}
</script>
