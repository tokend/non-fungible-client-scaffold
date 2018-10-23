<template>
  <div>
    <div class="app__form-row">
      <div class="app__form-field">
        <input-field-unchained
          id="first-name"
          v-model="form.firstName"
          v-validate="'required'"
          :label="'kyc_first_name' | translate"
          name="first name"
          :disabled="pending"
          :errorMessage="errorMessage('first name')"
        />
      </div>
    </div>

    <div class="app__form-row">
      <div class="app__form-field">
        <input-field-unchained
          id="last-name"
          v-model="form.lastName"
          v-validate="'required'"
          :label="'kyc_last_name' | translate"
          name="last name"
          :disabled="pending"
          :errorMessage="errorMessage('last name')"
        />
      </div>
    </div>

    <div class="app__form-actions">
      <button v-ripple
              @click="submitForm"
              :disabled="pending"
              class="app__form-submit-btn">
        {{ 'lbl_submit' | translate }}
      </button>
    </div>
  </div>
</template>

<script>
  import FormMixin from '@/vue/common/mixins/form.mixin'
  import { commonEvents } from '@/js/events/common_events'

  export default {
    mixins: [FormMixin],
    props: {
      pending: { type: Boolean, default: false }
    },
    data: _ => ({
      form: {}
    }),
    methods: {
      submitForm () {
        this.$emit(commonEvents.submitLoginKycEvent, this.form)
      }
    }
  }
</script>

<style lang="scss">

</style>
