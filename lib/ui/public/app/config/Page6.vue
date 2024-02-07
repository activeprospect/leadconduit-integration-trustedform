<template>
  <div>
    <header>
      Configure TrustedForm Insights
    </header>
    <section>
      <h3>Page Scan Forbidden/Required Text</h3>
      <p>
        Please set your required and/or forbidden text for the TrustedForm set in LeadConduit;
        the step will fail if the required term is missing and if the forbidden term is present in the page.
        <a href="https://community.activeprospect.com/posts/4078890">Learn More</a>
      </p>
      <Form :actions="false">
        <SelectField
          name="PageScan Required"
          v-model="requiredTags"
          :options="requiredOptions"
          taggable
          multiple
          @tag="handleRequiredTag"
          openDirection="bottom"
        ></SelectField>

        <SelectField
          name="PageScan Forbidden"
          v-model="forbiddenTags"
          :options="forbiddenOptions"
          taggable
          multiple
          @tag="handleForbiddenTag"
          openDirection="bottom"
        ></SelectField>
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
import { SelectField, Form } from '@activeprospect/ui-components';

export default {
  components: {
    Navigation,
    SelectField,
    Form
  },
  data() {
    return {
      /** @type {string[]} */
      requiredTags: [],
      /** @type {string[]} */
      requiredOptions: [],
      /** @type {string[]} */
      forbiddenTags: [],
      /** @type {string[]} */
      forbiddenOptions: [],
    }
  },
  methods: {
    handleRequiredTag(tag) {
      this.requiredTags.push(tag);
      this.requiredOptions.push(tag);
    },
    handleForbiddenTag(tag) {
      this.forbiddenTags.push(tag);
      this.forbiddenOptions.push(tag);
    },
    confirm() {
      this.$store.commit('setPageScan', {
        required: this.requiredTags,
        forbidden: this.forbiddenTags
      });
      this.$store.dispatch('confirm'); 
    },
  }
}
</script>

<style scoped>
/* All the selectors here use `:deep()` because otherwise the styles can't be scoped, since the classes are added by a library. */

/** override this style https://github.com/activeprospect/leadconduit-client/blob/a005d3ac5627aa39d12c64756561ef400b512bf3/public/css/core/forms.styl#L252-L254 */
:deep(input[type="text"]) {
  min-width: 0 !important;
}

:deep(.formkit-outer) {
  width: 100%;
}
</style>