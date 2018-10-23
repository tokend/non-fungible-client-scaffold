<template>
    <div class="app__page-content-wrp">
        <form novalidate @submit.prevent="submit">
            <div class="app__form-row">
                <div class="app__form-field">
                    <input-field-unchained
                            id="first-name"
                            v-model="kyc.name"
                            v-validate="'required'"
                            :label="i18n.kyc_name()"
                            name="first name"
                            :disabled="accountState === ACCOUNT_STATES.pending"
                            :errorMessage="errorMessage('first name')"
                    />
                </div>
            </div>

            <div class="app__form-row">
                <div class="app__form-field">
                    <date-field-flatpickr
                            v-model="kyc.dateOfBirth"
                            name="kyc-date-of-birth"
                            id="kyc-date-of-birth"
                            :label="i18n.kyc_date_of_birth()"
                            v-validate="'required'"
                            :disabled="accountState === ACCOUNT_STATES.pending"
                            :errorMessage="errorMessage('kyc-date-of-birth')"
                            :enable-time="false"
                    />
                </div>

                <div class="app__form-field">
                    <input-field-unchained
                            id="kyc-education"
                            v-model="kyc.education"
                            v-validate="'required'"
                            :label="i18n.kyc_education()"
                            name="kyc education"
                            :disabled="accountState === ACCOUNT_STATES.pending"
                            :errorMessage="errorMessage('kyc education')"
                    />
                </div>
            </div>

            <div class="app__form-row">
                <textarea-field
                        v-model="kyc.exhibition"
                        name="kyc-exhibition"
                        id="kyc-exhibition"
                        :label="i18n.kyc_exhibition()"
                        :disabled="accountState === ACCOUNT_STATES.pending"
                        :maxlength="250"
                />
            </div>

            <div class="app__form-row">
                <input-field-unchained
                        id="kyc-direction"
                        v-model="kyc.direction"
                        v-validate="'required'"
                        :label="i18n.kyc_direction()"
                        name="kyc direction"
                        :disabled="accountState === ACCOUNT_STATES.pending"
                        :errorMessage="errorMessage('kyc direction')"
                />
            </div>

            <div class="app__form-row">
                <textarea-field
                        v-model="kyc.about"
                        name="kyc-about"
                        id="kyc-about"
                        :label="i18n.kyc_about()"
                        :maxlength="500"
                        :disabled="accountState === ACCOUNT_STATES.pending"
                        v-validate="'required'"
                        :errorMessage="errorMessage('kyc-about')"
                />
            </div>

            <div class="app__form-row">
                <input-field-unchained
                        id="form-socials-telegram"
                        v-model="kyc.socials.telegram"
                        v-validate="'required'"
                        :label="'Telegram (to contact you)'"
                        name="form-socials-telegram"
                        :errorMessage="errorMessage('form-socials-telegram')"
                />
            </div>

            <div class="app__form-row">
                <file-field
                        v-model="kyc.documents[documentTypes.kycIdDocument]"
                        :label="'kyc_passport' | translate"
                        id="kyc-id-document"
                        :disabled="isPending || accountState === ACCOUNT_STATES.pending"
                        :type="documentTypes.kycIdDocument"
                />
            </div>
            <div class="app__form-row">
                <file-field
                        v-model="kyc.documents[documentTypes.kycContract]"
                        :label="i18n.kyc_contract()"
                        id="kyc-contract"
                        :disabled="isPending || accountState === ACCOUNT_STATES.pending"
                        :type="documentTypes.kycContract"
                />
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
  import {i18n} from '@/js/i18n'
  import {mapGetters, mapActions} from 'vuex'
  import {vuexTypes} from '@/vuex/types'
  import {accountsService} from '@/js/services/accounts.service'
  import {userTypes, documentTypes, blobTypes, ACCOUNT_TYPES, ACCOUNT_STATES} from '@/js/const/const'
  import {confirmAction} from '@/js/modals/confirmation_message'
  import {fileService} from '@/js/services/file.service'
  import {EventDispatcher} from '@/js/events/event_dispatcher'
  import {ErrorHandler} from '@/js/errors/error_handler'
  import {KycTemplateParser} from '../spec/kyc-template-parser'

  const KYC_LEVEL_TO_SET = 0

  export default {
    mixins: [FormMixin],
    data: _ => ({
      kyc: {
        socials: {},
        documents: {}
      },
      i18n,
      ACCOUNT_TYPES,
      ACCOUNT_STATES,
      documentTypes,
      blobTypes
    }),
    async created () {
      await Promise.all([
        this.loadTokens(),
        this.loadBalances()
      ])
      this.kyc = KycTemplateParser.fromTemplate(this.accountKycData, userTypes.syndicate)
    },
    computed: {
      ...mapGetters([
        vuexTypes.accountId,
        vuexTypes.accountTypeI,
        vuexTypes.accountKycLatestRequest,
        vuexTypes.accountKycData,
        vuexTypes.accountState
      ])
    },
    methods: {
      ...mapActions({
        loadTokens: vuexTypes.GET_ALL_TOKENS,
        loadBalances: vuexTypes.GET_ACCOUNT_BALANCES,
        loadKycRequests: vuexTypes.GET_ACCOUNT_KYC_REQUESTS,
        updateKycData: vuexTypes.UPDATE_ACCOUNT_KYC_DATA,
        updateDocuments: vuexTypes.UPDATE_ACCOUNT_KYC_DOCUMENTS
      }),

      async addDocument (documentType) {
        const termsContainer = this.kyc.documents[documentType]
        if (termsContainer && !termsContainer.isUploaded) {
          const logoKey = await fileService.uploadFile(termsContainer.getDetailsForUpload())
          termsContainer.setKey(logoKey)
        }
      },

      async submit () {
        if (!await confirmAction()) return
        this.disable()
        try {
          await this.addDocument(documentTypes.kycIdDocument)
          await this.addDocument(documentTypes.kycContract)
          const blobId = await this.updateKycData({
            details: KycTemplateParser.toTemplate(this.kyc, userTypes.syndicate),
            documents: KycTemplateParser.getSaveableDocuments(this.kyc.documents),
            blobType: blobTypes.syndicate_kyc.str
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
          accountTypeToSet: ACCOUNT_TYPES.syndicate,
          kycLevelToSet: KYC_LEVEL_TO_SET,
          kycData: {blob_id: blobId}
        })
      }
    }
  }
</script>
