<template>
  <Modal
    title="Join Whitelist"
    :visible="show"
    :footer="null"
    :mask-closable="true"
    :closable="false"
    :width="470"
    @cancel="$emit('onCancel')"
    centered
  >
    <img class="modal-close" src="@/assets/icons/close-circle.svg" @click="$emit('onCancel')" />
    <div class="subscribe-container">
      <div class="notice-container">
        <div class="notice-title fcs-container">
          <img class="alert-icon" src="@/assets/icons/alert-yellow.svg" />
          <span class="font-large weight-bold">Subscription Notice</span>
        </div>
        <span class="font-small weight-semi spacing-small" v-html="this.content"></span>
      </div>
      <Checkbox class="check-container" v-model="countryCheck">
        <label class="font-small weight-semi spacing-large">I confirm that my country is not in this list</label>
      </Checkbox>
      <hcaptcha class="text-center" />
      <div class="info-container fb-container">
        <img class="info-icon" src="@/assets/icons/info.svg" />
        <label class="font-small weight-bold">
          You will have to validate a transaction to confirm your subscription.
        </label>
      </div>
      <div class="btn-container">
        <Button
          :disabled="subscribeLoading"
          class="btn-transparent font-medium weight-semi letter-small icon-cursor"
          @click="onSubmit"
          >Join Whitelist</Button
        >
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Checkbox } from 'ant-design-vue'
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Checkbox
  },

  props: {
    show: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      countryCheck: false as boolean,
      captchaCheck: false as boolean,
      subscribeLoading: false as boolean
    }
  },

  methods: {
    onSubmit() {
      //@ts-ignore
      this.$hcaptcha
        .getResponse()
        .then((res: any) => {
          if (res) {
            this.captchaCheck = true
            this.subscribeLoading = true
          }
        })
        .catch((error: any) => {
          this.subscribeLoading = false
        })
        .finally(() => {
          if (this.captchaCheck && this.countryCheck) {
            this.subscribeLoading = false
            this.$emit('onOk')
          }
          this.subscribeLoading = false
        })
    }
  },
  mounted() {
    //@ts-ignore
    // this.$hcaptcha.reset()
    this.subscribeLoading = false
  }
})
</script>
<style lang="less" scoped>
// global stylesheet
.btn-container {
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 48px;
  height: auto;
  width: 100%;
}

.btn-transparent {
  background: transparent;
  width: 100%;
  padding: 10px;
  border-radius: 48px;
  border: none;
  outline: none;
}

.info-icon {
  width: 12px;
  height: 12px;
  margin-right: 8px;
}
</style>
<style lang="less">
.subscribe-container {
  .notice-container {
    background: @color-blue600;
    padding: 24px;
    border-radius: 8px;
    margin-top: 18px;
    height: 300px;
    overflow-y: scroll;

    .notice-title {
      margin-bottom: 16px;

      .alert-icon {
        margin-right: 16px;
      }
    }
  }

  .check-container {
    margin: 24px 0;

    label {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .info-container {
    margin-top: 24px;

    label {
      color: @color-blue100;
    }
  }

  .btn-container {
    margin-top: 24px;
  }
}

// ant checkbox
.ant-checkbox {
  .ant-checkbox-inner {
    background: transparent;
    width: 21px;
    height: 21px;
    border-radius: 7px;
    border: 2px solid @color-blue300;

    &::after {
      position: absolute !important;
      top: 2px;
      left: 2px;
      width: 13px;
      height: 13px;
      border-radius: 4px;
      border: none !important;
      transform: scale(1) !important;
      transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86) !important;
      background-color: @color-farms;
    }
  }

  &.ant-checkbox-checked {
    .ant-checkbox-inner {
      border-color: @color-farms !important;
      background: transparent;
    }

    &::after {
      border: none;
    }
  }
}

.ant-checkbox-wrapper:hover .ant-checkbox-inner,
.ant-checkbox:hover .ant-checkbox-inner,
.ant-checkbox-input:focus + .ant-checkbox-inner {
  border-color: @color-farms !important;
}
</style>