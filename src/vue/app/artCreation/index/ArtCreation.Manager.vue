<template>
   <div class="art-creation-form">
    <h2 class="app__page-heading">{{ i18n.arts_form_creation() }}</h2>
    <form novalidate @submit.prevent="submit">
      <div class="art-creation-form__content-item">
        <file-field fileType="image"
                    v-model="documents[documentTypes.assetPhoto]"
                    :label="i18n.arts_photo()"
                    :minWidth='120'
                    :minHeight='120'
                    :accept="'image/*'"
                    :type="documentTypes.assetPhoto"/>
      </div>
      <div class="art-creation-form__content-item">
        <div class="app__form-row">
          <div class="app__form-field">
            <input-field-unchained
              id="art-name"
              v-model="request.tokenName"
              v-validate="'required'"
              :label="i18n.arts_name()"
              name="art name"
              :errorMessage="errorMessage('art name')"
            />
          </div>
        </div>
        <div class="app__form-row">
          <div class="app__form-field">
            <input-field-unchained
              id="art-code"
              v-model="request.tokenCode"
              v-validate="'required'"
              :label="i18n.arts_code()"
              name="art code"
              :disabled="true"
              maxlength="16"
              :errorMessage="errorMessage('art code')"
            />
          </div>
          <div class="app__form-field">
            <input-field-unchained
              id="art-direction"
              v-model="request.direction"
              v-validate="'required'"
              :label="i18n.arts_direction()"
              name="art direction"
              :errorMessage="errorMessage('art direction')"
            />
          </div>
        </div>
        <div class="app__form-row">
          <div class="app__form-field">
            <input-field-unchained
              id="art-width"
              v-model="request.artWidth"
              v-validate="'required'"
              :label="i18n.arts_width()"
              name="art width"
              type="number"
              :errorMessage="errorMessage('art width')"
            />
          </div>
          <div class="app__form-field">
            <input-field-unchained
              id="art-height"
              v-model="request.artHeight"
              v-validate="'required'"
              :label="i18n.arts_height()"
              name="art height"
              type="number"
              :errorMessage="errorMessage('art height')"
            />
          </div>
        </div>

        <div class="app__form-row">
          <textarea-field v-model="request.description"
            v-validate="'required'"
            :maxlength="250"
            :label="i18n.arts_input_description()"
          />
        </div>
      </div>

      <div class="app__form-actions">
        <button v-ripple
                type="submit"
                class="app__form-submit-btn"
                :disabled="isPending">
          {{ i18n.lbl_submit() }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import FormMixin from '../../../common/mixins/form.mixin'
import FileField from '../../../common/fields/FileField'

import { mapGetters } from 'vuex'
import { vuexTypes } from '@/vuex/types'

import { i18n } from '@/js/i18n'
import { documentTypes } from '@/js/const/documents.const'

import { tokensService } from '@/js/services/tokens.service'
import { ASSET_POLICIES } from '@/js/const/xdr.const'
import { EventDispatcher } from '@/js/events/event_dispatcher'
import { ErrorHandler } from '@/js/errors/error_handler'

import { DocumentContainer } from '@/js/helpers/DocumentContainer'
import { reviewableRequestsService } from '@/js/services/reviewable_requests.service'
import { fileService } from '@/js/services/file.service'
import { ArtCreationRecord } from '@/js/records/art_creation.record'

const INITIAL_PREISSUED_AMOUNT = '100'
const DEFAULT_POLICIES = [ASSET_POLICIES.requiresKyc, ASSET_POLICIES.canBeBaseInAtomicSwap, ASSET_POLICIES.transferable]
export default {
  mixins: [FormMixin],
  components: { FileField },
  props: ['id'],
  data: _ => ({
    ASSET_POLICIES,
    request: {
      tokenCode: '',
      policies: DEFAULT_POLICIES
    },
    documents: {
      [documentTypes.assetPhoto]: null
    },
    i18n,
    documentTypes
  }),

  watch: {
    documents: {
      handler () {
        if (!this.id) {
          this.request.tokenCode = (this.documents[documentTypes.assetPhoto].hash || '').substring(0, 16)
        }
      },
      deep: true
    }
  },

  async created () {
    if (this.id) {
      const request = new ArtCreationRecord(await reviewableRequestsService.loadReviewableRequestById(this.id))
      request.photo.type = documentTypes.assetPhoto
      this.request = request
      this.documents[documentTypes.assetPhoto] = request.photo.key ? new DocumentContainer(request.photo) : null
    }
  },

  computed: {
    ...mapGetters([
      vuexTypes.accountId
    ])
  },
  methods: {
    async submit () {
      if (!await this.isValid()) return
      this.disable()
      try {
        await this.createRequest()
        EventDispatcher.dispatchShowSuccessEvent(i18n.kyc_upload_success())
        this.$router.push({ path: '/requests/token-creation' })
      } catch (error) {
        ErrorHandler.processUnexpected(error)
      }
      this.enable()
    },

    async createRequest () {
      let preissuedAssetSigner = this.accountId
      let initialPreissuedAmount = INITIAL_PREISSUED_AMOUNT

      if (this.id) {
        preissuedAssetSigner = this.request.preissuedAssetSigner
        initialPreissuedAmount = this.request.initialPreissuedAmount
      }

      const photoContainer = this.documents[documentTypes.assetPhoto]

      if (photoContainer && !photoContainer.isUploaded) {
        const photoKey = await fileService.uploadFile(photoContainer.getDetailsForUpload())
        photoContainer.setKey(photoKey)
      }

      await tokensService.createTokenCreationRequest({
        requestID: this.request.requestID ? this.request.requestID : '0',
        code: this.request.tokenCode,
        preissuedAssetSigner: preissuedAssetSigner,
        maxIssuanceAmount: initialPreissuedAmount,
        policies: this.request.policies.reduce((a, b) => (a | b), 0),
        initialPreissuedAmount: initialPreissuedAmount,
        details: {
          isPublic: true,
          name: this.request.tokenName,
          direction: this.request.direction,
          artWidth: this.request.artWidth,
          artHeight: this.request.artHeight,
          description: this.request.description,
          photo: photoContainer ? photoContainer.getDetailsForSave() : {}
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .art-creation-form__content-item:not(:last-child) {
    margin-bottom: 24px;
  }
</style>
