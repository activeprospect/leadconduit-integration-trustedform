<template>
  <div>
    <header>
      Set Up TrustedForm Data Service
    </header>
    <section>
      <p>Below is a list of data points included with this enhancement. When configuring your flow, you can choose to accept, reject, or re-route leads based on each of the values returned.</p>
      <table>
        <thead>
          <tr>
            <th>Data Point</th>
            <th>Description</th>
            <th>How You Might Use It</th>
          </tr>
        </thead>
        <tbody>
          <tr
              v-for="(value, key, index) in fields"
              :key="key"
              :class="index % 2 ? 'gray-theme' : 'light-theme'"
          >
            <td>{{ key }}</td>
            <td>{{ value.description }}</td>
            <td>{{ value.use }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <Navigation/>
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue';

export default {
  data() {
    return {
      fields: this.$store.state.fieldData,
    };
  },
  components: {
    Navigation
  }
};
</script>
