<template>
  <md-field class="textarea-field"
            :class="{
              'textarea-field--readonly': readonly,
              'textarea-field--disabled': disabled
            }">
    <label class="textarea-field__label" :for="id" v-if="label">{{ label }}</label>
    <md-textarea
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :md-counter="counter"
      :value="value"
      :name="name"
      :id="id"
      :readonly="readonly"
      :tabindex="readonly ? -1 : 0"
      @input="onInput"
      class="textarea-field__textarea"
    />
    <span class="md-error" v-if="errorMessage">{{ errorMessage }}</span>
  </md-field>
</template>

<script>
import FieldMixin from './field.mixin'

export default {
  name: 'textarea-field',
  mixins: [FieldMixin],
  props: {
    value: { default: undefined },
    maxlength: { type: [Number, null], default: null },
    counter: { type: [Number, null], default: null },
    readonly: { type: Boolean, default: false }
  }
}
</script>

<style scoped lang="scss">
@import "./scss/fields-variables.scss";

.textarea-field {
  margin: 0 !important;
  background-color: $textarea-background-color !important;
}

.textarea-field:after,
.textarea-field.md-field.md-theme-default.md-has-textarea:not(.md-autogrow):before {
  // TODO: kill yourselves, vue-material
  border-color: $field-color-unfocused !important;
}

.textarea-field.md-field.md-theme-default.md-has-textarea:not(.md-autogrow):before {
  border-color: $col-md-primary-secondary !important;
}

.textarea-field--readonly.textarea-field:after,
.textarea-field--disabled.textarea-field:after {
  border-style: dashed !important;
}

.textarea-field--readonly.textarea-field.md-field.md-theme-default.md-has-textarea:not(.md-autogrow):before,
.textarea-field--disabled.textarea-field.md-field.md-theme-default.md-has-textarea:not(.md-autogrow):before {
  border: none !important;
}

.textarea-field__label {
  @include text-font-sizes;
  color: $field-color-unfocused !important;
}

.textarea-field.md-focused > .textarea-field__label,
.textarea-field.md-has-value > .textarea-field__label {
  @include label-font-sizes;
  color: $col-md-primary-secondary !important;
}

.textarea-field__textarea {
  @include text-font-sizes;
  color: $field-color-text !important;
  -webkit-text-fill-color: $field-color-text !important;
}
</style>
