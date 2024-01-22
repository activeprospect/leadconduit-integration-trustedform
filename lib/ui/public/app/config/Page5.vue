<template>
  <div>
    <header>
      Configure TrustedForm Insights
    </header>
    <section>
      <form>
        <h3>Select Insights Data Points</h3>
        <p>TrustedForm Insights provides the following data related to the lead that filled out the form. Each selection of data points will be charged individually.</p>
        <table>
          <thead>
            <tr>
              <th>
                <input id="select-all" type="checkbox" class="fancy-checkbox" v-model="header" :indeterminate.prop="selected === 'some'" @click="toggleAll">
                <label for="select-all" class="checkbox-label"></label>
              </th>
              <th><label for="select-all" class="text-label">Data Point</label></th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in Object.keys(fields)" :key="fields[field].name">
              <td>
                <input :id="field" type="checkbox" class="fancy-checkbox" v-model="fields[field].selected" @change="updateHeader">
                <label :for="field" class="checkbox-label"></label>
              </td>
              <td><label :for="field" class="text-label">{{fields[field].name}}</label></td>
              <td v-html="fields[field].description"></td>
            </tr>
          </tbody>
        </table>
      </form>
    </section>
    <Navigation
      :onConfirm="confirm"
      :disableConfirm="selected === 'none'"
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
    confirm () {
      this.$store.state.v4Fields = this.fields;
      this.$store.dispatch('confirm');
    }
  },
  mounted () {
    // ensure header is set correctly when returning to this page with some props selected
    this.updateHeader();
  }
}
</script>

<style scoped>
table {
  position: relative;
}

th {
  position: sticky;
  top: 0;
  background-color: #f4f6f8;
  border-bottom: 1px solid #dfe4e8;
}

/*
We are using "fancy-checkbox" in an atypical way;
Typically, the <label> and <input> components are siblings, and there is only 1 label for the checkbox.
However, since our fancy-checkbox is supposed to be placed in a separate <td> and have additional padding,
We have to add some additional styling and a second <label> element.
*/
.checkbox-label {
  /* !important is needed because of this style https://github.com/activeprospect/leadconduit-client/blob/618797873a9fc485bf2d51873043700aae9d496e/public/css/core/forms.styl#L495 */
  padding: 1.2em !important;
}

.text-label {
  /* !important is needed because of this style https://github.com/activeprospect/leadconduit-client/blob/618797873a9fc485bf2d51873043700aae9d496e/public/css/core/forms.styl#L429 */
  margin: 0 !important;
}
</style>