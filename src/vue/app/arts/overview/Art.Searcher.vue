<template>
    <div class="searcher-wrapper">

        <div class="searcher-header">
            <h4 class="searcher-title"> Search filters </h4>
        </div>

        <div class="searcher__inner">

            <div class="searcher__filters">
                <input-field-unchained
                        v-model="filters.code"
                        class="searcher__filter"
                        name="token-code"
                        :whiteAutofill="true"
                        :label="i18n.lbl_art_code()"
                />
            </div>
            <div class="searcher__filters">
                <input-field-unchained
                        v-model="filters.name"
                        class="searcher__filter"
                        name="token-name"
                        :whiteAutofill="true"
                        :label="i18n.lbl_art_name()"
                />
            </div>
            <div class="searcher__filters">
                <input-field-unchained
                        v-model="filters.description"
                        class="searcher__filter"
                        name="token-description"
                        :whiteAutofill="true"
                        :label="i18n.lbl_art_description()"
                />
            </div>
        </div>

    </div>
</template>

<script>
  import InputField from '../../../common/fields/InputField'
  import SelectFieldUnchained from '@/vue/common/fields/SelectFieldUnchained'
  import InputFieldUnchained from '@/vue/common/fields/InputFieldUnchained'
  import { i18n } from '../../../../js/i18n'
  import { commonEvents } from '../../../../js/events/common_events'
  import debounce from 'lodash/debounce'
  import { saleSortTypes, saleStates } from '../../../../js/const/const'

  export default {
    name: 'searcher',

    components: {
      InputField,
      SelectFieldUnchained,
      InputFieldUnchained
    },

    props: [],

    data () {
      return {
        filters: {
          code: '',
          name: '',
          description: ''
        },
        eventEmitter: null,
        i18n,
        states: Object.values(saleStates).map(state => state.str),
        sortTypes: Object.values(saleSortTypes).map(type => type.str)
      }
    },

    methods: {
      debounceSearchEvent () {
        if (!this.eventEmitter) {
          this.eventEmitter = debounce(() => this.$emit(commonEvents.searchInputEvent, this.composeFilters()), 450)
        }
        return this.eventEmitter()
      },
      composeFilters () {
        const filters = {
          code: this.filters.code.toLowerCase(),
          name: this.filters.name.toLowerCase(),
          description: this.filters.description.toLowerCase()
        }
        return filters
      }
    },

    watch: {
      'filters.code': function () { this.debounceSearchEvent() },
      'filters.name': function () { this.debounceSearchEvent() },
      'filters.description': function () { this.debounceSearchEvent() }
    }
  }
</script>

<style lang="scss" scoped>
    @import '~@scss/variables';
    @import '~@scss/mixins';
    $filterWidth: 100% / 3;

    .searcher-header {
        width: 100%;
    }

    .searcher__inner {
        display: flex;
    }

    .searcher-title {
        font-weight: bold;
        font-size: 1.4 * $point;
        color: $col-md-primary;
        padding: 0;
        opacity: 1;
        margin-bottom: 1 * $point;
    }

    .searcher-wrapper {
        background: $col-content-block;
        box-shadow: 0px 2px 4px 0 rgba(0, 0, 0, 0.08);
        margin: 0 0 1.5rem;
        padding: 2.4 * $point 2.4 * $point;
    }

    .searcher__filters {
        width: $filterWidth;
        max-width: $filterWidth;
        flex: 1;

        &:not(:first-child) {
            margin-left: 1.5 * $point;
        }
    }
</style>
