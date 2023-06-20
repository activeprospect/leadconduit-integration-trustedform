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
              <th><input type="checkbox" v-model="header" :indeterminate.prop="selected === 'some'" @click="toggleAll"></th>
              <th>Select All</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in Object.keys(fields)" :key="fields[field].name">
              <td><input type="checkbox" v-model="fields[field].selected" @change="updateHeader"></td>
              <td>{{fields[field].name}}</td>
              <td v-html="fields[field].description"></td>
            </tr>
          </tbody>
        </table>
      </form>
    </section>
    <Navigation
      :onFinish="finish"
      :disableFinish="selected === 'none'"
    />
  </div>
</template>
<script>
import { Navigation } from '@activeprospect/integration-components'
import { filter } from 'lodash';

export default {
  data () {
    return {
      fields: this.$store.state.v4Fields,
      header: false,
      selected: 'none'
    };
  },
  components: {
    Navigation
  },
  methods: {
    amountSelected () {
      // 'some', 'all', or 'none'
      const totalFields = Object.keys(this.fields).length;
      const selectedFields = filter(this.fields, function (field) { return field.selected; }).length;
      if (selectedFields === 0) return 'none';
      if (totalFields === selectedFields) return 'all';
      return 'some';
    },
    toggleAll () {
      // set to false when 'all' are selected, otherwise set to true
      const bool = this.amountSelected() !== 'all';
      for (const field in this.fields) {
        this.fields[field].selected = bool;
      }
      this.updateHeader();
    },
    updateHeader () {
      this.selected = this.amountSelected();
      this.header = this.selected === 'all';
    },
    finish () {
      this.$store.state.v4Fields = this.fields;
      this.$store.dispatch('finish');
    }
  },
  mounted () {
    // ensure header is set correctly when returning to this page with some props selected
    this.updateHeader();
  }
}
</script>
