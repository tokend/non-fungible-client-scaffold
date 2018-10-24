<template>
  <div class="arts-explore">
    <searcher
            class="sales-overview__searcher"
            @search-input="filterArt"
    />
    <template v-if="!isLoaded">
      <loader :message="i18n.arts_loading()"/>
    </template>
    <template v-else-if="artList.length > 0">
      <div class="arts-explore__sale-overview-inner">
        <div class="arts-explore__card-wrapper-outer"
          v-for="art in artList"
          :key="art.code">
          <router-link :to="{name: 'arts.art-details', params: { id: art.code }}"
                      tag="button"
                      class="arts-explore__card-wrapper">
            <art-card class="arts-explore__card" :art="art"/>
          </router-link>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="app__page-content-wrp">
        <h2 class="app__page-heading">{{ i18n.arts_no_arts_heading() }}</h2>
        <p class="app__page-explanations app__page-explanations--secondary">
          {{ i18n.arts_no_arts() }}
        </p>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { vuexTypes } from '../../../../vuex/types'
  import { i18n } from '@/js/i18n'

  import Loader from '@/vue/app/common/Loader'
  import ArtCard from '../art_card/Arts.ArtCard'
  import Searcher from './Art.Searcher'

  export default {
    name: 'SalesExplore',
    components: { ArtCard, Loader, Searcher },
    data: _ => ({
      isLoaded: false,
      filters: {},
      i18n
    }),
    async created () {
      await this.getArts()
      this.isLoaded = true
    },
    computed: {
      ...mapGetters([
        vuexTypes.arts
      ]),
      artList () {
        const list = this.arts.slice(0).reverse()
        if (Object.keys(this.filters).length) {
          return list
            .filter(art => {
              return art.code.toLowerCase().indexOf(this.filters.code) !== -1
            })
            .filter(art => {
              return art.name.toLowerCase().indexOf(this.filters.name) !== -1
            })
            .filter(art => {
              return (art.description || '').toLowerCase().indexOf(this.filters.description) !== -1
            })
        } else {
          return list
        }
      }
    },
    methods: {
      ...mapActions({
        getArts: vuexTypes.GET_ALL_ARTS
      }),
      filterArt (filters) {
        this.filters = filters
      }
    },
    watch: {}
  }
</script>

<style lang="scss" scoped>
  @import '../../../../scss/variables';
  @import '../../../../scss/mixins';

  .arts-explore {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin: auto;
  }

  .arts-explore__sale-overview-inner {
    margin: 0 auto;
    margin: -1.2 * $point;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .arts-explore__card-wrapper-outer {
    padding: 1.2 * $point;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;

    flex: 0.333;
    min-width: 33.333%;
    max-width: 33.333%;

    @include respond-to(xmedium) {
      flex: 0.5;
      min-width: 49.999%;
      max-width: 50%;
    }

    @media only screen and (max-width: 767px) {
      flex: 1;
      min-width: 100%;
    }
  }

  .arts-explore__card-wrapper {
    display: block;
    background: $col-content-block;
    box-shadow: 0px 2px 4px 0 rgba(0, 0, 0, 0.08);
    border: none;
    flex: 1;
    cursor: pointer;
    font-size: initial;
    text-align: initial;
  }

  .arts-explore__btn {
    color: $col-active;
  }

  .arts-explore__no-sales-found-msg {
    padding: 10px 40px;
    text-align: center;
    background-color: $col-content-block;
    margin: 0 auto;
    .icon {
      margin-bottom: 20px;
      i {
        font-size: $material-icon-xx-super-big;
        line-height: 1;
      }
    }
  }
</style>
