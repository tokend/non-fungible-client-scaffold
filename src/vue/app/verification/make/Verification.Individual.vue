<template>
  <div class="kyc-form app__page-content-wrp">
    <form novalidate @submit.prevent="submit">
      <div class="app__form-row">
        <div class="app__form-field">
          <input-field-unchained
            id="first-name"
            v-model="kyc.firstName"
            v-validate="'required'"
            :label="i18n.kyc_first_name()"
            name="first name"
            :disabled="accountState === ACCOUNT_STATES.pending"
            :errorMessage="errorMessage('first name')"
          />
        </div>
      </div>

      <div class="app__form-row">
        <div class="app__form-field">
          <input-field-unchained
            id="last-name"
            v-model="kyc.lastName"
            v-validate="'required'"
            :label="i18n.kyc_last_name()"
            name="last name"
            :disabled="accountState === ACCOUNT_STATES.pending"
            :errorMessage="errorMessage('last name')"
          />
        </div>
      </div>

      <div class="app__form-actions">
        <button v-ripple
                type="submit"
                class="app__form-submit-btn"
                :disabled="isPending || accountState === ACCOUNT_STATES.pending">
          {{ i18n.lbl_submit() }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
  import FormMixin from '@/vue/common/mixins/form.mixin'

  import { mapGetters, mapActions } from 'vuex'
  import { ErrorHandler } from '@/js/errors/error_handler'
  import { EventDispatcher } from '@/js/events/event_dispatcher'
  import { vuexTypes } from '@/vuex/types'
  import { i18n } from '@/js/i18n'

  import { KycTemplateParser } from '../spec/kyc-template-parser'
  import { accountsService } from '@/js/services/accounts.service'

  import { userTypes, blobTypes, ACCOUNT_TYPES, ACCOUNT_STATES } from '@/js/const/const'
  import { confirmAction } from '@/js/modals/confirmation_message'

  const KYC_LEVEL_TO_SET = 0

  export default {
    mixins: [FormMixin],
    data: _ => ({
      kyc: {},
      i18n,
      ACCOUNT_STATES,
      userTypes
    }),
    created () {
      this.kyc = KycTemplateParser.fromTemplate(this.accountKycData, userTypes.general)
    },
    computed: {
      ...mapGetters([
        vuexTypes.accountId,
        vuexTypes.accountKycData,
        vuexTypes.accountState,
        vuexTypes.accountKycLatestRequest
      ]),
      verificationKey () {
        return this.accountId.slice(1, 6)
      }
    },
    methods: {
      ...mapActions({
        loadKycRequests: vuexTypes.GET_ACCOUNT_KYC_REQUESTS,
        updateKycData: vuexTypes.UPDATE_ACCOUNT_KYC_DATA
      }),
      async submit () {
        if (!await confirmAction()) return
        this.disable()
        try {
          const blobId = await this.updateKycData({
            details: KycTemplateParser.toTemplate(this.kyc, userTypes.general),
            blobType: blobTypes.kycForm.str
          })
          await this.submitRequest(blobId)
          await this.loadKycRequests()
          EventDispatcher.dispatchShowSuccessEvent(i18n.kyc_upload_success())
        } catch (error) {
          console.error(error)
          ErrorHandler.processUnexpected(error)
        }
        this.enable()
      },
      async submitRequest (blobId) {
        await accountsService.createKycRequest({
          requestID: this.accountState === ACCOUNT_STATES.rejected ? this.accountKycLatestRequest.id : '0',
          accountToUpdateKYC: this.accountId,
          accountTypeToSet: ACCOUNT_TYPES.general,
          kycLevelToSet: KYC_LEVEL_TO_SET,
          kycData: { blob_id: blobId }
        })
      }
    }
  }
</script>

<style lang="scss">

</style>
