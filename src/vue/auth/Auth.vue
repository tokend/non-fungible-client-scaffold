<template>
  <div class="auth-page">
    <div class="auth-page__titles">
      <h3 class="auth-page__title-small">{{ 'auth_phrase' | translate }}</h3>
      <h1 class="auth-page__title" v-html="translate('auth_title')"></h1>
    </div>
    <div class="auth-page__form">
      <logotype class="auth-page__form-logotype"/>
      <router-view/>
      <app-footer/>
    </div>
  </div>
</template>

<script>
  import Logotype from '../app/common/Logotype'
  import AppFooter from '../navigation/Footer'
  import { translate } from '@/vue/common/filters/translate'

  export default {
    components: {
      Logotype,
      AppFooter
    },

    data () {
      return {
      }
    },
    methods: {
      translate
    }
  }
</script>

<style lang="scss">
  @import 'auth';
  @import '~@scss/variables';
  .auth-page__form {
    padding-bottom: 3.5 * $point;
  }
</style>
