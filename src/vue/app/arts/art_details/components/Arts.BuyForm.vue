<template>
  <div>
    <form @submit.prevent="submit" :id="`art-buy-form-${_uid}`">
      <template v-if="!this.quoteAsset">
        <div class="app__form-row">
          <select-field-unchained v-model="form.quoteAsset"
                                  :values="mappedAssets"
                                  :key="form.quoteAsset"
                                  :label="i18n.art_buy_form_select_asset()"
          />
        </div>
      </template>

      <div class="app__form-row">
        <input-field-unchained
                v-model.trim="form.amount"
                :label="i18n.art_buy_form_input_price()"
                name="order-quote-amount"
                min="0"
                step="0.000001"
                class="app__input"
                v-validate="'required'"
                :white-autofill="true"
                type="number"
        />
      </div>
    </form>
    <div class="app__form-actions">
      <button v-ripple
              class="app__button-raised"
              :disabled="!!(isPending || inputErrorMsg)"
              :form="`art-buy-form-${_uid}`">
        {{ i18n.art_buy_form_button_submit() }}
      </button>
      <button v-ripple
              class="app__button-flat"
              @click="emitClose"
              :disabled="isPending">
        {{ i18n.art_buy_form_button_cancel() }}
      </button>
    </div>
  </div>
</template>

<script>
import InputField from '@/vue/common/fields/InputField'
import FormMixin from '@/vue/common/mixins/form.mixin'
import OrderMakerMixin from './order-maker.mixin'

import { confirmAction } from '@/js/modals/confirmation_message'
import { multiply } from '@/js/utils/math.util'
import { i18n } from '@/js/i18n'

import { vuexTypes } from '@/vuex/types'
import { mapGetters, mapActions } from 'vuex'

const CLOSE_FORM_EVENT = 'close-form'

export default {
  name: 'trade-orders-buy',
  mixins: [FormMixin, OrderMakerMixin],
  components: { InputField },
  props: {
    art: { type: Object, required: true },
    quoteAsset: { type: String, required: false }
  },
  data () {
    return {
      form: {
        quoteAsset: this.quoteAsset || '',
        price: '0.000001',
        amount: '',
        quoteAmount: ''
      },
      inputErrorMsg: '',
      allowToValidPrice: false,
      allowToValidAmount: false,
      i18n
    }
  },
  async created () {
    if (!this.quoteAsset) {
      await this.loadTokens()
      if (!this.form.quoteAsset) {
        this.form.quoteAsset = this.mappedAssets[0]
      }
    }
  },
  computed: {
    ...mapGetters([
      vuexTypes.walletNonStatsTokens,
      vuexTypes.accountBalances
    ]),
    mappedAssets () {
      if (!this.assets || !this.assets.length) return
      return this.assets.map(item => item.code)
    },
    quoteAmount () {
      return multiply(this.form.amount, this.form.price)
    }
  },
  methods: {
    ...mapActions({
      loadTokens: vuexTypes.GET_ALL_TOKENS
    }),
    multiply,
    validateForm () {
      if (+this.quoteAmount >
        +this.accountBalances[this.form.quoteAsset].balance) {
        this.inputErrorMsg = this.i18n.art_buy_form_available_balance({
          asset: this.form.quoteAsset,
          amount: this.i18n.c(this.accountBalances[this.form.quoteAsset].balance)
        })
      } else {
        this.inputErrorMsg = ''
      }
    },
    async submit () {
      this.allowToValidPrice = true
      if (!await this.isValid()) return
      if (!await confirmAction()) return
      this.errors.clear()

      this.disable()
      await this.createOrder({
        pair: {
          base: this.art.code,
          quote: this.quoteAsset || this.form.quoteAsset
        },
        baseAmount: this.form.amount,
        quoteAmount: this.quoteAmount,
        price: this.form.price,
        isBuy: true
      })
      this.enable()
      this.resetForm()
      this.emitClose()
    },
    resetForm () {
      this.form.amount = ''
      setTimeout(() => this.changeAllow(), 0)
    },
    changeAllow () {
      this.allowToValidPrice = false
      this.allowToValidAmount = false
    },
    emitClose () {
      this.$emit(CLOSE_FORM_EVENT)
    }
  },
  watch: {
    'form.price' () {
      this.validateForm()
      this.allowToValidPrice = true
    },
    'form.amount' () {
      this.validateForm()
      this.allowToValidAmount = true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@scss/variables";

  .app__form-row .app__input {
    margin-left: 10px;
  }

  .buy-form__total-offer {
    color: $col-md-primary-inactive;
    position: absolute;
    bottom: 1.7rem;
    right: 1.25rem;
  }
</style>
