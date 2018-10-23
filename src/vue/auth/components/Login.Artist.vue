<template>
  <div>
    <div class="app__form-row">
      <div class="app__form-field">
        <input-field-unchained
          id="first-name"
          v-model="form.name"
          v-validate="'required'"
          :label="'kyc_name' | translate"
          name="first name"
          :disabled="pending"
          :errorMessage="errorMessage('first name')"
        />
      </div>
    </div>

    <div class="app__form-row">
      <div class="app__form-field">
        <date-field-flatpickr
          v-model="form.dateOfBirth"
          name="kyc-date-of-birth"
          id="kyc-date-of-birth"
          :label="'kyc_date_of_birth' | translate"
          v-validate="'required'"
          :errorMessage="errorMessage('kyc-date-of-birth')"
          :enable-time="false"
          :disabled="pending"
        />
      </div>

      <div class="app__form-field">
        <input-field-unchained
          id="kyc-education"
          v-model="form.education"
          v-validate="'required'"
          :label="'kyc_education' | translate"
          name="kyc education"
          :disabled="pending"
          :errorMessage="errorMessage('kyc education')"
        />
      </div>
    </div>

    <div class="app__form-row">
      <textarea-field
        v-model="form.exhibition"
        name="kyc-exhibition"
        id="kyc-exhibition"
        :label="'kyc_exhibition' | translate"
        :maxlength="250"
        :disabled="pending"
      />
    </div>

    <div class="app__form-row">
      <input-field-unchained
        id="kyc-direction"
        v-model="form.direction"
        v-validate="'required'"
        :label="'kyc_direction' | translate"
        name="kyc direction"
        :disabled="pending"
        :errorMessage="errorMessage('kyc direction')"
      />
    </div>

    <div class="app__form-row">
      <textarea-field
        v-model="form.about"
        name="kyc-about"
        id="kyc-about"
        :label="'kyc_about' | translate"
        :maxlength="500"
        v-validate="'required'"
        :disabled="pending"
        :errorMessage="errorMessage('kyc-about')"
      />
    </div>

    <div class="app__form-row">
      <input-field-unchained
        id="form-socials-telegram"
        v-model="form.socials.telegram"
        v-validate="'required'"
        :label="'Telegram (to contact you)'"
        name="form-socials-telegram"
        :disabled="pending"
        :errorMessage="errorMessage('form-socials-telegram')"
      />
    </div>

    <div class="app__form-row">
      <file-field
        v-model="form.documents[documentTypes.kycIdDocument]"
        :label="'kyc_passport' | translate"
        id="kyc-id-document"
        :disabled="pending"
        :type="documentTypes.kycIdDocument"
      />
    </div>

    <div class="app__form-row">
      <file-field
        v-model="form.documents[documentTypes.kycContract]"
        :label="'kyc_contract' | translate"
        id="kyc-contract"
        :disabled="pending"
        :type="documentTypes.kycContract"
      />
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
  import { ACCOUNT_STATES, documentTypes } from '@/js/const/const'
  import { commonEvents } from '@/js/events/common_events'

  export default {
    mixins: [FormMixin],
    props: {
      pending: { type: Boolean, default: false }
    },
    data: _ => ({
      ACCOUNT_STATES,
      documentTypes,
      form: {
        name: '',
        dateOfBirth: '',
        education: '',
        exhibition: '',
        direction: '',
        about: '',
        socials: {},
        documents: {}
      }
    }),
    methods: {
      submitForm () {
        this.$emit(commonEvents.submitLoginKycEvent, this.form)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@scss/variables';
</style>
