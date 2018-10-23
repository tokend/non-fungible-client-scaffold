<template>
  <div class="login-user-type-selector">
    <div class="login-user-type-selector__type">
      <h3>{{ 'login_general' | translate }}</h3>
      <p>{{ 'login_inv_tip' | translate }}</p>
      <button v-ripple
              @click="selectType(userTypes.general)"
              class="app__button-raised user-type-selector__user-button">
        {{ 'kyc_apply_general' | translate }}
      </button>
    </div>
    <div class="login-user-type-selector__type">
      <h3>{{ 'login_corporate' | translate }}</h3>
      <p>{{ 'login_corporate_tip' | translate }}</p>
      <button v-ripple
              @click="selectType(userTypes.syndicate)"
              class="app__button-raised user-type-selector__user-button">
        {{ 'kyc_apply_corporate' | translate }}
      </button>
    </div>
  </div>
</template>

<script>
  import Logotype from '@/vue/app/common/Logotype'
  import AppFooter from '@/vue/navigation/Footer'
  import { userTypes } from '@/js/const/const'
  import { commonEvents } from '@/js/events/common_events'

  export default {
    components: {
      Logotype,
      AppFooter
    },

    data () {
      return {
        userTypes,
        events: {
          selectUserType: commonEvents.selectUserTypeEvent
        }
      }
    },

    methods: {
      selectType (type) {
        this.$emit(commonEvents.selectUserTypeEvent, type)
      }
    }
  }
</script>

<style lang="scss">
  @import '~@scss/variables';

  .login-user-type-selector {
    display: flex;
    justify-content: space-around;
    margin-top: 56px;
  }

  .login-user-type-selector__type {
    text-align: center;

    h3 {
      margin-bottom: 24px;
      font-size: 22px;
    }

    p {
      font-size: 1.4 * $point;
      color: $col-md-primary-inactive;
      margin-bottom: 2.4 * $point;
    }
  }
</style>
