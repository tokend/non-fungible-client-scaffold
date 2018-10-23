<template>
  <div class="sidebar">
    <section class="sidebar__logotype">
      <router-link @click.native="closeSidebar" to="/dashboard">
        <logotype class="sidebar__logotype-icon"/>
      </router-link>
    </section>

    <section class="sidebar__list">
      <ul>
        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/arts"
                     tag="li" v-if="config.FEATURE_FLAGS.arts">
          <md-icon class="sidebar__list-item-icon">toll</md-icon>
          <span class="md-list-item-text">{{ i18n.sidebar_link_arts() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/dashboard"
                     tag="li"
                     v-if="isLoggedIn && config.FEATURE_FLAGS.dashboard">
          <md-icon class="sidebar__list-item-icon">dashboard</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_dashboard_page() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/deposit"
                     tag="li" v-if="config.FEATURE_FLAGS.deposit">
          <md-icon class="sidebar__list-item-icon">file_download</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_deposit() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/withdrawal"
                     tag="li" v-if="config.FEATURE_FLAGS.withdrawal">
          <md-icon class="sidebar__list-item-icon">file_upload</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_withdraw() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/transfers"
                     tag="li"
                     v-if="isLoggedIn && config.FEATURE_FLAGS.transfers">
          <md-icon class="sidebar__list-item-icon">send</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_send() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/mass-transfers"
                     tag="li" v-if="config.FEATURE_FLAGS.massTransfers">
          <md-icon class="sidebar__list-item-icon">people</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_send_mass() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/trade"
                     tag="li" v-if="config.FEATURE_FLAGS.trade">
          <md-icon class="sidebar__list-item-icon">compare_arrows</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_trade() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/tokens"
                     tag="li" v-if="config.FEATURE_FLAGS.tokens">
          <md-icon class="sidebar__list-item-icon">toll</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_explore_tokens_page() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/sales"
                     tag="li" v-if="config.FEATURE_FLAGS.sales">
          <md-icon class="sidebar__list-item-icon">trending_up</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_explore_sales() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/art-creation"
                     tag="li"
                     v-if="config.FEATURE_FLAGS.artCreation && accountTypeI === ACCOUNT_TYPES.syndicate">
          <md-icon class="sidebar__list-item-icon">palette</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_create_art_page() }}</span>
        </router-link>
        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/requests/token-creation"
                     tag="li"
                     v-if="config.FEATURE_FLAGS.artCreation && accountTypeI === ACCOUNT_TYPES.syndicate">
          <md-icon class="sidebar__list-item-icon">aspect_ratio</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_manager_arts() }}</span>
        </router-link>
      </ul>
    </section>

    <section class="sidebar__section sidebar__section--account sidebar__list"
      v-if="isLoggedIn">
      <div class="sidebar__list-title">{{ i18n.sidebar_section_account() }}</div>
      <ul>
        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/verification"
                     tag="li" v-if="config.FEATURE_FLAGS.verification">
          <md-icon class="sidebar__list-item-icon">verified_user</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_verification() }}</span>
        </router-link>

        <router-link v-ripple class="sidebar__list-item"
                     @click.native="closeSidebar"
                     to="/settings"
                     tag="li" v-if="config.FEATURE_FLAGS.settings">
          <md-icon class="sidebar__list-item-icon">settings</md-icon>
          <span class="md-list-item-text">{{ i18n.lbl_settings_page() }}</span>
        </router-link>
      </ul>
    </section>

    <div class="sidebar__guest-hint" v-if="!isLoggedIn">
      <md-icon>help_outline</md-icon>
      <span>{{ 'sidebar_guest_hint' | translate }}</span>
    </div>

    <app-footer :is-sidebar-background="true"/>
  </div>
</template>

<script>
  import config from '../.././config'

  import { mapGetters } from 'vuex'
  import { vuexTypes } from '../../vuex/types'
  import { i18n } from '../../js/i18n'
  import Logotype from '../app/common/Logotype'
  import AppFooter from '../navigation/Footer'
  import { ACCOUNT_TYPES } from '@/js/const/const'

  export default {
    name: 'sidebar',

    components: {
      Logotype,
      AppFooter
    },

    data () {
      return {
        isSidebarOpened: false,
        i18n,
        config,
        ACCOUNT_TYPES
      }
    },

    computed: {
      ...mapGetters([
        vuexTypes.accountTypeI,
        vuexTypes.isLoggedIn
      ])
    },

    methods: {
      openSidebar () {
        this.isSidebarOpened = true
      },
      closeSidebar () {
        this.isSidebarOpened = false
        this.$emit('hide-sidebar', this.isSidebarOpened)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@scss/variables';

  .sidebar {
    background-color: #e9eaed !important;
    box-shadow: inset -10px -10px 20px 0 rgba(0, 0, 0, .03);
    min-height: 100vh;
    height: 100%;
    padding-bottom: 5.8 * $point;
    overflow-y: auto;
  }

  .sidebar__list-item {
    display: flex;
    align-items: center;
    min-height: 48px;
    cursor: pointer;
    color: $col-md-primary-inactive;

    &.router-link-active {
      background-color: #f0f1f4;
      font-weight: 500;
      color: $col-md-primary;
    }
  }

  .sidebar__list-title,
  .sidebar__list-item {
    padding: 0 8px;
  }

  .sidebar__logotype {
    padding: 40px 20px 50px;
  }

  .sidebar__logotype-icon {
    width: 95px;
    display: block;
    width: 100%;
  }

  .sidebar__list-item-icon {
    margin-right: 16px;
    color: $col-md-primary-inactive !important; // TODO: remove important rule when possible

    .router-link-active & {
      color: $col-md-primary !important;
    }
  }

  .sidebar__section--account {
    margin-top: 50px;
  }

  .sidebar__list-title {
    color: $col-md-primary;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .sidebar__guest-hint {
    margin-top: 50px;
    color: $col-md-primary-inactive;
    padding: 0 6px;
    display: flex;
    align-items: flex-start;

    & > .md-icon {
      color: $col-md-primary-inactive;
      margin: 0;
      margin-right: 16px;
    }
  }

</style>
