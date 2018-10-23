<template>
  <div class="art-attributes-tab">
    <div class="details-column">
      <detail-row
        :prop="i18n.art_attributes_tab_label_name()"
        :value="art.name"
      />
      <detail-row
        :prop="i18n.art_attributes_tab_label_code()"
        :value="art.code"
      />
      <detail-row
        :prop="i18n.art_attributes_tab_label_width()"
        :value="art.width"
      />
      <detail-row
        :prop="i18n.art_attributes_tab_label_height()"
        :value="art.height"
      />
      <detail-row
        :prop="i18n.art_attributes_tab_label_direction()"
        :value="art.direction"
      />

      <label class="art-attributes-tab__data-label">
        {{ i18n.art_attributes_tab_label_description() }}
      </label>

      <p class="art-attributes-tab__description">
        {{ art.description }}
      </p>
    </div>
  </div>
</template>

<script>
import DetailRow from '@/vue/app/common/Detail.Row'
import { i18n } from '@/js/i18n'
import { ASSET_POLICIES } from '@/js/const/xdr.const'

export default {
  components: {
    DetailRow
  },
  props: ['art'],
  data: _ => ({
    i18n
  }),
  methods: {
    getPolicies (item) {
      const policies = []
      item.forEach(element => {
        policies.push(Object.keys(ASSET_POLICIES)
          .filter(policy => ASSET_POLICIES[policy] === element))
      })
      return policies.join(', ').replace(/([a-z])([A-Z])/g, '$1 $2')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";

.art-attributes-tab__data-label {
  display: inline-block;
  margin: 3 * $point 0 1 * $point 0;
  font-weight: bold;
  font-size: 1.4 * $point;
  color: $col-md-primary-inactive;
}

.art-attributes-tab__description {
  font-size: 1.6 * $point;
  color: $col-md-primary;
  line-height: 1.5;
}
</style>
