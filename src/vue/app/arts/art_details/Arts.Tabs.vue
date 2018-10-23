<template>
  <tabs class="app__tabs app__tabs--md"
    v-if="isReady"
    :options="{ useUrlFragment: false }">
    <tab :name="i18n.art_tabs_label_attributes()">
      <art-tab :art="art" />
    </tab>
    <tab :name="i18n.art_tabs_label_artist()">
      <artist-tab :artist-kyc="artistKyc" />
    </tab>
    <tab :name="i18n.art_tabs_label_provenance()">
      <provenance-tab :art="art" />
    </tab>
  </tabs>
</template>

<script>
  import ArtTab from './tabs/Arts.ArtTab'
  import ArtistTab from './tabs/Arts.ArtistTab'
  import ProvenanceTab from './tabs/Arts.ProvenanceTab'

  import { i18n } from '@/js/i18n'
  export default {
    props: ['art', 'artistKyc'],
    data () {
      return {
        i18n
      }
    },
    components: {
      ArtTab,
      ArtistTab,
      ProvenanceTab
    },
    computed: {
      isReady () { return !!this.art.code }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../scss/variables';
  @import '../../../../scss/mixins';

  .art-tabs {
    @include box-shadow;
  }
</style>
