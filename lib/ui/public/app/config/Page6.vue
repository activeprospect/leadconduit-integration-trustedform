<template>
  <div>
    <header>
      Configure TrustedForm Insights
    </header>
    <section>
      <h3>Page Scan Forbidden/Required Text</h3>
      <p>Please set your required and/or forbidden text for the TrustedForm set in LeadConduit; the step will fail if the required term is missing and if the forbidden term is present in the page.</p>
      <Form v-model="values.value" @submit="handleSubmit" legend="Select Field">
        <SelectField
          name="pagescan"
          :options="taggable.value"
          taggable
          multiple
          @tag="handleTag"
        ></SelectField>
      </Form>
    </section>
    <Navigation
      :onConfirm="confirm"
      :disableConfirm="taggable.length === 0"
    />
  </div>
</template>
<script setup>
import { Navigation } from '@activeprospect/integration-components';
import { SelectField, Form } from '@activeprospect/ui-components';
import { toRaw, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const values = ref({});
const taggable = ref([]);

function handleTag(tag) {
  console.log({tag, taggable: toRaw(taggable)})
}

function handleSubmit() {
  console.log('submit', toRaw(values), toRaw(taggable))
}

function confirm() {
  store.dispatch('confirm'); 
}
</script>
