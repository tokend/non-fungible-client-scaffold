<template>
  <div class="art-artist-tab">
    <template v-if="artistKyc">
      <div class="details-column">
        <detail-row
          :prop="'art_artist_tab_label_email' | translate"
          :value="get(artistKyc, 'email')"
        />
        <detail-row
          :prop="'art_artist_tab_label_name' | translate"
          :value="get(artistKyc, 'details.name')"
        />
        <detail-row
          :prop="'art_artist_tab_label_education' | translate"
          :value="get(artistKyc, 'details.education')"
        />
        <detail-row
          :prop="'art_artist_tab_label_direction' | translate"
          :value="get(artistKyc, 'details.direction')"
        />
        <detail-row
          :prop="'art_artist_tab_label_exhibition' | translate"
          :value="get(artistKyc, 'details.exhibition')"
        />

        <label class="art-artist-tab__data-label">
          {{ 'art_artist_tab_label_about' | translate }}
        </label>

        <p class="art-artist-tab__description">
          {{ get(artistKyc, 'details.about') }}
        </p>
      </div>
    </template>
    <template v-else>
      <p class="art-artist-tab__unavailable-for-guests app__page-explanations app__page-explanations--secondary">
        {{ 'art_artist_tab_no_data_title' | translate }}
      </p>
      <router-link
        tag="button"
        class="app__button-raised art-artist-tab__unavailable-for-guests-login-btn"
        :to="{ name: 'login' }">
        {{ 'lbl_signin' | translate }}
      </router-link>
    </template>
  </div>
</template>

<script>
import DetailRow from '@/vue/app/common/Detail.Row'
import get from 'lodash/get'

export default {
  components: {
    DetailRow
  },
  props: ['artistKyc'],
  data: _ => ({

  }),
  methods: {
    get
  }
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";

.art-artist-tab__data-label {
  display: inline-block;
  margin: 3 * $point 0 1 * $point 0;
  font-weight: bold;
  font-size: 1.4 * $point;
  color: $col-md-primary-inactive;
}

.art-artist-tab__description {
  font-size: 1.6 * $point;
  color: $col-md-primary;
  line-height: 1.5;
}

.art-artist-tab__unavailable-for-guests {
  padding-top: 24px;
  margin-bottom: 16px !important;
  text-align: center;
  max-width: 100% !important;
}

.art-artist-tab__unavailable-for-guests-login-btn {
  margin: 0 auto 24px;
  display: block;
}
</style>
