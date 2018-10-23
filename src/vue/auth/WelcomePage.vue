<template>
  <div class="login-welcome-page">
    <h3 class="login-welcome-page__title">
      Welcome!
    </h3>
    <p class="login-welcome-page__description">
      {{ accountTypeI === ACCOUNT_TYPES.general
          ? translate('welcome_general_message')
          : translate('welcome_syndicate_message') }}
    </p>
    <router-link
      :to="{ name: 'app' }"
      tag="button"
      class="app__button-raised login-welcome-page__continue-btn"
      v-ripple>
      {{ 'lbl_continue' | translate }}
    </router-link>
  </div>
</template>

<script>
  import { vuexTypes } from '@/vuex/types'
  import { mapGetters } from 'vuex'
  import { ACCOUNT_TYPES } from '@/js/const/const'
  import { translate } from '@/vue/common/filters/translate'

  export default {
    data () {
      return {
        ACCOUNT_TYPES
      }
    },
    methods: {
      translate
    },
    computed: {
      ...mapGetters([
        vuexTypes.accountTypeI
      ])
    }
  }
</script>

<style lang="scss">
  @import '~@scss/variables';

  .login-welcome-page__title {
    font-size: 24px;
    margin-bottom: 32px;
    text-align: center;
    line-height: 1.4;
  }

  .login-welcome-page__description {
    font-size: 18px;
    margin-bottom: 32px;
    text-align: center;
    line-height: 1.4;
  }

  .login-welcome-page__continue-btn {
    display: block;
    margin: 0 auto;
  }
</style>
