<template>
  <div>
    <div v-if="failed" class="app__page-content-wrp">
      <h2 class="app__page-heading">{{ i18n.art_details_load_failed_heading() }}</h2>
      <p class="app__page-explanations app__page-explanations--secondary">
        {{ i18n.art_details_load_failed() }}
      </p>
    </div>

    <div v-else-if="!ready" class="app__page-content-wrp">
      <loader :message="i18n.art_details_loading()"/>
    </div>

    <div v-else class="art-details">
      <div class="art-details__header">
        <h1 class="art-details__heading"> {{ art.name }} ({{ art.code }})</h1>
        <p class="art-details__description">{{ art.description }}</p>
      </div>
      <div class="art-details__content">
        <div class="art-details__art-photo-wrp">
          <img class="art-details__art-photo-img md-image"
              :src="art.photoUrl"
              alt="crowdfund banner">
        </div>
      </div>
      <div class="art-details__tabs">
        <art-tabs :art="art" :artist-kyc="artistKyc" />
      </div>
      <div class="art-details__market">
        <art-market :art="art" @art-update-request="loadDetails" />
      </div>
    </div>
  </div>
</template>

<script>
import { artsService } from '@/js/services/arts.service'
import ArtMarket from '../art_details/components/Arts.Market'
import { i18n } from '@/js/i18n'

import { vuexTypes } from '@/vuex/types'
import { mapGetters } from 'vuex'
import Loader from '@/vue/app/common/Loader'

import ArtTabs from './Arts.Tabs'

export default {
  name: 'art-details',
  props: ['id'],
  components: {
    ArtTabs,
    ArtMarket,
    Loader
  },

  data: _ => ({
    art: {},
    artistKyc: {},
    ready: false,
    failed: false,
    loadDetailsBlocked: false,
    i18n
  }),

  computed: {
    ...mapGetters([
      vuexTypes.isLoggedIn
    ])
  },
  async created () {
    if (this.id) {
      try {
        await this.loadDetails()
        this.ready = true
      } catch (error) {
        console.error(error)
        this.failed = true
      }
    }
  },

  methods: {
    async loadDetails () {
      if (this.loadDetailsBlocked) return
      this.loadDetailsBlocked = true
      this.art = await artsService.get(this.id)
      this.isLoggedIn
        ? this.artistKyc = await artsService.loadOwner(this.art.owner)
        : this.artistKyc = null
      this.loadDetailsBlocked = false
    }
  }
}
</script>

<style lang="scss">
@import "~@scss/variables";
@import "~@scss/mixins";

.art-details {
  max-width: 1000px;
  margin: 0 auto;
}

.art-details__content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  @media (max-width: 1000px) {
    flex-direction: column;
  }
}

.art-details__art-photo-wrp {
  position: relative;
  padding-bottom: 57%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.art-details__art-photo-img {
  @include box-shadow;
  position: absolute;
  height: 100%;
  object-fit: contain;
  border: 10px solid white;
}

.art-details__header {
  margin-bottom: 3 * $point;
}

.art-details__heading {
  font-size: 2 * $point;
  line-height: 1.5;
  margin: 0.8 * $point 0;
  vertical-align: middle;
  color: $col-md-primary;
  opacity: 1;
}

.art-details__description {
  font-size: 1.6 * $point;
  color: $col-md-primary-inactive;
}

.art-details__tabs {
  margin-bottom: 3.2 * $point;
}
</style>
