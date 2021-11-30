<template>
  <div>
    <header>
      Set Up TrustedForm Data Service
    </header>
    <section>
      <p>Below is a list of data points included with this enhancement. When configuring your flow, you can choose to accept, reject, or re-route leads based on each of the values returned.</p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data Point</th>
              <th>Description</th>
              <th>Possible Use</th>
            </tr>
          </thead>
          <tbody>
            <tr
                v-for="(value, key) in fields"
                :key="key"
            >
              <td>{{ key }}</td>
              <td>{{ value.description }}</td>
              <td>{{ value.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <Navigation :onNext="onNext"/>
  </div>
</template>

<script>
import { Navigation } from '@activeprospect/integration-components';

export default {
  data () {
    return {
      fields: this.$store.state.fieldData
    };
  },
  components: {
    Navigation
  },
  methods: {
    onNext () {
      this.$router.push('/3');
    }
  }
};
</script>
