<template>
  <div v-if="fileType === 'image'">
    <div class="file-field__label">
      {{ label }}
    </div>
    <div class="image-input">
      <div class="image-input__image-preview" v-if="fileUrl">
        <img :src="fileUrl">
      </div>

      <div class="image-input__input-inner">

        <div class="image-input__text">
          <div class="title">{{ i18n.lbl_choose_image() }}</div>

          <div class="notes">
            <p class="image-input__note" v-for="(note, key) in notes" :key="key">{{ note }}</p>
          </div>
        </div>

        <input type="file"
               accept="image/*"
               @change="onChange">
      </div>
    </div>
  </div>
  <div v-else class="file-field__outer">
    <div class="file-field">
      <div class="file-field__label">
        {{ label }}
      </div>

      <label :for="id"
             class="file-field__uploader"
             :class="{
               'file-field__uploader--disabled': disabled
             }">
        <md-icon class="file-field__icon md-icon-size-075x">insert_drive_file</md-icon>
        {{ acceptLabel }}
      </label>

      <input type="file"
            class="file-field__input"
            :id="id"
            :name="name"
            :required="required"
            :disabled="disabled"
            :placeholder="placeholder"
            :accept="accept"
            @change="onChange"
      />
    </div>
    <p class="file-field__file-name">
      <button v-if="value && value.file" class="link-btn" type="button" @click="viewNew">
        <span>{{ value.name }}</span>&nbsp;<md-icon class="md-icon-size-065x">open_in_new</md-icon>
      </button>

      <a :href="fileUrl" target="_blank" v-else-if="value && fileUrl" class="link-btn">
        <span>{{ value.name }}</span>&nbsp;<md-icon class="md-icon-size-065x">open_in_new</md-icon>
      </a>

      <span v-else>{{ i18n.fi_no_file_chosen() }}</span>
    </p>
  </div>
</template>

<script>
  import FieldMixin from './field.mixin'
  import { DocumentContainer } from '../../../js/helpers/DocumentContainer'
  import { MAX_FILE_MEGABYTES } from '../../../js/const/documents.const'
  import { EventDispatcher } from '../../../js/events/event_dispatcher'
  import { dispatchAppEvent } from '../../../js/events/helpers'
  import { commonEvents } from '../../../js/events/common_events'
  import { i18n } from '../../../js/i18n'
  import { FileHelper } from '../../../js/helpers/file.helper'
  import config from '../../../config'

  export default {
    name: 'file-field',
    mixins: [FieldMixin],
    props: {
      type: { type: String, default: 'default' },
      private: { type: Boolean, default: false },
      minSize: { type: Number, default: null },
      maxSize: { type: Number, default: MAX_FILE_MEGABYTES },
      minWidth: { type: Number, default: null },
      minHeight: { type: Number, default: null },
      accept: { type: String, default: 'image/png, image/jpeg' },
      notes: { type: Array, default: () => ['JPEG, PNG or BMP', 'no more than 15mb'] },
      fileType: { type: String, default: 'default' }
    },
    data: _ => ({
      fileName: '',
      privateUrl: '',
      i18n,
      fileStorage: config.FILE_STORAGE,
      flags: {
        isReadyToDrop: false
      }
    }),
    computed: {
      maxB () {
        return this.maxSize * 1024 * 1024
      },

      minB () {
        return this.minSize * 1024 * 1024
      },

      fileUrl () {
        if (!this.value) return ''
        if (this.value.file) {
          return this.value.dataUrl
        }
        if (!this.private) {
          return this.value.publicUrl
        }
        return this.value.privateUrl
      },

      acceptLabel () {
        switch (this.accept) {
          case '.iss':
            return i18n.fi_upload_iss_file()
          case '.csv':
            return i18n.fi_upload_csv_file({ size: i18n.n(this.maxSize) })
          default:
            return i18n.fi_upload_file({ size: i18n.n(this.maxSize) })
        }
      }
    },
    async created () {
      if (this.private && this.value) {
        await this.handlePrivate()
      }
    },
    methods: {
      async onChange (event) {
        const file = FileHelper.deriveFileFromChangeEvent(event)
        if (file && !this.isValidFileSize(file)) return
        if (file.type.indexOf('image') !== -1) {
          if (!(await this.checkImageDimensions(file))) return
        }

        this.$emit(commonEvents.inputEvent, new DocumentContainer({
          mimeType: file.type,
          type: this.type,
          name: file.name,
          file: file
        }))
      },

      isValidFileSize (file) {
        if (this.maxSize && file.size > this.maxB) {
          EventDispatcher.dispatchShowErrorEvent(i18n.max_file_size_exceeded({ size: this.maxSize }))
          this.clear()
          return false
        } else if (this.minSize && file.size < this.minB) {
          EventDispatcher.dispatchShowErrorEvent(i18n.min_file_size_fail({ size: this.minSize }))
          this.clear()
          return false
        } else {
          return true
        }
      },

      async checkImageDimensions (file) {
        const reader = await FileHelper.readFileAsDataURL(file)
        const image = await FileHelper.readImage(reader)
        if (this.minWidth && this.minHeight && (image.naturalWidth < this.minWidth || image.naturalHeight < this.minHeight)) {
          EventDispatcher.dispatchShowErrorEvent(i18n.min_image_dimension_fail({ width: this.minWidth, height: this.minHeight }))
          return false
        }
        if (this.minWidth && image.naturalWidth < this.minWidth) {
          EventDispatcher.dispatchShowErrorEvent(i18n.min_image_width_fail({ width: this.minWidth }))
          return false
        }
        if (this.minHeight && image.naturalHeight < this.minHeight) {
          EventDispatcher.dispatchShowErrorEvent(i18n.min_image_height_fail({ height: this.minHeight }))
          return false
        }
        return true
      },

      async handlePrivate () {
        if (this.value.derivePrivateUrl) {
          await this.value.derivePrivateUrl()
        }
      },
      clear () {
        this.$el
          .querySelectorAll('input')
          .forEach(input => { input.value = '' })
      },
      viewNew () {
        if (!this.fileUrl) return
        dispatchAppEvent(commonEvents.openFileViewEvent, this.fileUrl)
      }
    },
    watch: {
      async value (value) {
        if (!value) return
        if (!value.key) {
          await this.value.deriveDataUrl()
          return
        }
        if (this.private) {
          await this.handlePrivate()
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~@scss/variables';
  @import '~@scss/mixins';

  $flex-margin: 1 * $point;

  .file-field__outer {
    display: flex;
    align-items: center;
    margin-bottom: .8rem;
    flex-wrap: wrap;
    margin-left: -$flex-margin;
    margin-right: -$flex-margin;
  }

  .file-field {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .file-field__label {
    font-size: $fs-tip;
    color: $col-md-primary-inactive;
    margin-left: $flex-margin;
    margin-bottom: 8px;
  }

  .file-field__uploader {
    @include button();
    @include button-raised();
    white-space: nowrap;
    margin: 0 $flex-margin;
  }

  .file-field__uploader--disabled {
    opacity: .5;
  }

  .file-field__icon {
    color: $col-md-primary-txt !important;
    margin-right: .5rem;
    position: relative;
    bottom: .05rem;
  }

  .file-field__input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .file-field__file-name {
    margin: 0 $flex-margin;
    min-height: 3.6 * $point;
    color: $col-md-primary-inactive;
    min-width: 20 * $point;
    align-self: flex-end;
    display: flex;
    align-items: center;
  }

  .link-btn {
    border: none;
    background: none;
    cursor: pointer;
    color: $col-md-primary;
    text-decoration: none;
    text-align: left;

    &:hover > span {
      text-decoration: underline;
    }

    &:focus {
      outline: none;
    }
  }

  .image-input {
    border: 1px dashed $col-unfocused;
    border-radius: 15px;
    transition: .2s;
    width: 100%;

    &:hover {
      border-color: $col-md-primary-secondary;
    }
  }

  .image-input__input-inner {
    height: 110px;
    position: relative;
    overflow: hidden;
    width: 100%;

    input[type='file'] {
      cursor: pointer;
      opacity: 0;
      height: 100%;
      width: 100%;
    }
  }

  .image-input__text {
    height: 100%;
    left: 0;
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: 5px;
    width: 100%;

    .title {
      color: $col-md-primary;
      margin-bottom: 10px;
    }
  }

  .image-input__note {
    color: $col-unfocused;
    font-size: $fs-tip;
    line-height: 160%;
  }

  $ratio_9: 153px;

  .image-input__image-preview {
    align-items: center;
    display: flex;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;

    img {
      border-radius: 15px 15px 0 0;
      object-fit: cover;
      width: 100%;
      height: $ratio_9;
      pointer-events: none;
    }
  }

</style>
