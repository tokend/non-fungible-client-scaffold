<template>
  <div v-if="!introductionRequired">
    <h2 class="auth-page__form-title">{{ 'lbl_signin' | translate }}</h2>
    <form novalidate @submit.prevent="generateSubmit().next()" id="login-form">
      <div class="app__form-row">
        <div class="app__form-field">
          <input-field-unchained
            class="input-field"
            id="login-email"
            v-model.trim="form.email"
            :label="'lbl_email' | translate"
            name="email"
            :errorMessage="errorMessage('email')"
            v-validate="'required'"
          />
        </div>
      </div>
      <div class="app__form-row">
        <div class="app__form-field">
          <input-field-unchained
            class="input-field"
            id="login-password"
            v-model.trim="form.password"
            type="password"
            :togglePassword="true"
            :label="'lbl_pwd' | translate"
            name="password"
            :errorMessage="errorMessage('password')"
            v-validate="'required'"
          />
        </div>
      </div>

      <div class="auth-page__submit">
        <button type="submit"
                class="auth-page__submit-btn"
                :disabled="isPending"
                v-ripple>
          {{ 'log_signin' | translate }}
        </button>

        <router-link tag="button"
                class="auth-page__secondary-submit-btn"
                :disabled="isPending"
                v-ripple
                :to="{ name: 'app' }">
          {{ 'auth_continue_as_guest_btn' | translate }}
        </router-link>
      </div>
    </form>

    <div class="auth-page__tips">
      <div class="auth-page__tip">
        {{ 'log_dont_have_an_account' | translate }}
        <router-link class="auth-page__tip-link" :to="{ name: 'signup' }">
          {{ 'log_register_now' | translate }}
        </router-link>
      </div>
      <div class="auth-page__tip">
        {{ 'log_forgot_password' | translate }}
        <router-link class="auth-page__tip-link" :to="{ name: 'recovery' }">
          {{ 'log_recover_it' | translate }}
        </router-link>
      </div>
    </div>
  </div>
  <div v-else-if="introductionRequired && !selectedUserType">
    <h2 class="auth-page__form-title">
      {{ 'login_choose_account_type' | translate }}
    </h2>
    <user-type-selector @select-user-type="selectUserType"/>
  </div>
  <div v-else>
    <h2 class="auth-page__form-subtitle">
      {{ 'auth_chose_account_type_path_one' | translate }}
      <span class="auth-page__form-subtitle--strong">
        {{ ACCOUNT_TYPES_VERBOSE[selectedUserType] }}
      </span>
      {{ 'auth_chose_account_type_path_two' | translate }}
      <button type="button"
              class="auth-page__form-subtitle--inline-button"
              @click="backToSecondStep">Change</button>
    </h2>
    <template v-if="selectedUserType === userTypes.general">
      <form-general :pending="isPending" @submit-login-kyc="submitLoginKycUploaded"/>
    </template>
    <template v-else-if="selectedUserType === userTypes.syndicate">
      <form-artist :pending="isPending" @submit-login-kyc="submitLoginKycUploaded"/>
    </template>
  </div>
</template>

<script>
  import formMixin from '@/vue/common/mixins/form.mixin'
  import UserTypeSelector from './components/Login.UserTypeSelector'
  import FormGeneral from './components/Login.General'
  import FormArtist from './components/Login.Artist'

  import { errors } from '@/js/errors/factory'
  import { EventDispatcher } from '@/js/events/event_dispatcher'
  import { ErrorHandler } from '@/js/errors/error_handler'
  import { dispatchAppEvent } from '@/js/events/helpers'
  import { commonEvents } from '@/js/events/common_events'
  import { mapActions, mapGetters } from 'vuex'
  import { vuexTypes } from '@/vuex/types'

  import { confirmAction } from '@/js/modals/confirmation_message'
  import { showAlert } from '@/js/modals/alert_message'
  import { WalletHelper } from '@/js/helpers/wallet.helper'
  import { walletService } from '@/js/services/wallet.service'
  import { emailService } from '@/js/services/email.service'
  import { usersService } from '@/js/services/users.service'
  import { translate } from '@/vue/common/filters/translate'
  import { blobTypes, ACCOUNT_TYPES, documentTypes, userTypes } from '@/js/const/const'
  import { accountsService } from '@/js/services/accounts.service'
  import { KycTemplateParser } from '@/vue/app/verification/spec/kyc-template-parser'
  import { fileService } from '@/js/services/file.service'

  const ACCOUNT_TYPES_VERBOSE = Object.freeze({
    [userTypes.general]: 'General',
    [userTypes.syndicate]: 'Artist'
  })

  const KYC_LEVEL_TO_SET = 0

  export default {
    mixins: [formMixin],
    filters: {
      translate
    },

    components: {
      UserTypeSelector,
      FormGeneral,
      FormArtist
    },

    data: () => ({
      form: {},
      kyc: {},
      selectedUserType: '',
      submitGenerator: null,
      introductionRequired: false,
      ACCOUNT_TYPES,
      ACCOUNT_TYPES_VERBOSE,
      userTypes,
      hasSeenWarning: null
    }),

    created () {
      if (this.verifyEmailParams) return this.verifyEmail()
      this.hasSeenWarning = localStorage.hasOwnProperty('seenBlockWarning')
    },

    computed: {
      ...mapGetters([
        vuexTypes.accountId,
        vuexTypes.accountType,
        vuexTypes.accountBlocked
      ]),
      verifyEmailParams () {
        const token = this.$route.params.token
        const walletId = this.$route.params.walletId
        if (token && walletId) return { token, walletId }
        return null
      }
    },

    methods: {
      ...mapActions({
        setUserLoggedIn: vuexTypes.LOG_IN, // TODO
        processUserWallet: vuexTypes.PROCESS_USER_WALLET,
        loadAccount: vuexTypes.GET_ACCOUNT_DETAILS,
        loadUser: vuexTypes.GET_USER_DETAILS,
        loadBalances: vuexTypes.GET_ACCOUNT_BALANCES,
        loadKycRequests: vuexTypes.GET_ACCOUNT_KYC_REQUESTS,
        updateKycData: vuexTypes.UPDATE_ACCOUNT_KYC_DATA
      }),

      selectUserType (payload) {
        this.selectedUserType = payload
      },

      backToSecondStep () {
        this.selectedUserType = ''
        this.kyc = {}
      },

      submitLoginKycUploaded (payload) {
        this.kyc = payload
        this.submitGenerator.next()
      },

      async *submit () {
        if (!await this.isValid()) return
        this.form.email = this.form.email.toLowerCase()
        this.disable()
        try {
          await this.processUserWallet(this.form)
          const userExists = await usersService.checkIfUserExists()
          if (!userExists) {
            this.introductionRequired = true
            this.enable()
            yield
            this.disable()
            await usersService.createUser(this.accountId)
            await this.submitKyc()
          }
          await this.fetchUserDetails()
          await this.enterApplication(userExists)
        } catch (error) {
          switch (error.constructor) {
            case errors.NotFoundError:
              error.showBanner(translate('auth_not_found'))
              break
            case errors.EmailNotVerifiedError:
              this.handleNotVerifiedError()
              break
            default:
              ErrorHandler.processUnexpected(error)
          }
        }
        this.enable()
      },

      async addDocument (documentType) {
        const termsContainer = this.kyc.documents[documentType]
        if (termsContainer && !termsContainer.isUploaded) {
          const logoKey = await fileService.uploadFile(termsContainer.getDetailsForUpload())
          termsContainer.setKey(logoKey)
        }
      },

      async submitKyc () {
        try {
          if (this.selectedUserType === userTypes.syndicate) {
            await this.addDocument(documentTypes.kycIdDocument)
            await this.addDocument(documentTypes.kycContract)
          }
          const blobId = await this.updateKycData({
            details: KycTemplateParser.toTemplate(this.kyc, this.selectedUserType),
            documents: KycTemplateParser.getSaveableDocuments(this.kyc.documents),
            blobType: this.selectedUserType === userTypes.general
                        ? blobTypes.kycForm.str
                        : blobTypes.syndicate_kyc.str
          })
          await this.submitRequest(blobId)
          await this.loadKycRequests()
        } catch (error) {
          console.error(error)
          ErrorHandler.processUnexpected(error)
        }
        this.enable()
      },

      async submitRequest (blobId) {
        await accountsService.createKycRequest({
          requestID: '0',
          accountToUpdateKYC: this.accountId,
          accountTypeToSet: ACCOUNT_TYPES[this.selectedUserType],
          kycLevelToSet: KYC_LEVEL_TO_SET,
          kycData: { blob_id: blobId }
        })
      },

      generateSubmit () {
        this.submitGenerator = this.submit()
        return this.submitGenerator
      },

      async fetchUserDetails () {
        await Promise.all([
          this.loadUser(),
          this.loadAccount(),
          this.loadBalances()
        ])
      },

      enterApplication (userExistsStatus) {
        this.setUserLoggedIn()
        dispatchAppEvent(commonEvents.enterAppEvent)
        this.$router.push(this.$route.params.redirect || { name: userExistsStatus ? 'app' : 'welcome' })
        if (this.accountBlocked) {
          if (!this.hasSeenWarning) {
            localStorage.setItem('seenBlockWarning', 'User acknowledged about block')
            this.hasSeenWarning = true
            showAlert({
              title: translate('mod_accountBlocked_title'),
              message: translate('mod_accountBlocked_message')
            })
          }
        }
      },

      // TODO: wtf, need drop this away
      async handleNotVerifiedError () {
        if (!await confirmAction({
          title: translate('mod_email_not_verified_title'),
          message: translate('mod_email_not_verified_message')
        })) return
        this.disable()
        try {
          const kdf = await walletService.loadKdfParamsForEmail(this.form.email)
          const { walletId } = WalletHelper.calculateWalletParams(
            this.form.password,
            this.form.email,
            kdf.attributes().salt,
            kdf.attributes()
          )
          await emailService.sendResendEmailRequest(walletId)
          EventDispatcher.dispatchShowSuccessEvent(translate('auth_email_sent'))
        } catch (error) {
          ErrorHandler.processUnexpected(error)
        }
        this.enable()
      },

      async verifyEmail () {
        try {
          await emailService.sendVerifyEmailRequest(this.verifyEmailParams.token, this.verifyEmailParams.walletId)
          EventDispatcher.dispatchShowSuccessEvent(translate('auth_email_verified'))
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './auth';
</style>
