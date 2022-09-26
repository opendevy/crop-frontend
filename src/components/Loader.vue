<template>
  <Modal
    :title="null"
    :visible="true"
    :footer="null"
    :mask-closable="false"
    :closable="false"
    :width="470"
    @cancel="$emit('onCancel')"
    centered
  >
    <div class="loader-container">
      <div class="notice-container fcsb-container">
        <div class="fcs-container">
          <img class="info-icon-green" src="@/assets/icons/info-green.svg" />
          <span class="font-large weight-bold">{{ content }}</span>
        </div>
        <Spin :spinning="true">
          <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
        </Spin>
      </div>
      <div class="info-container fb-container">
        <img class="info-icon" src="@/assets/icons/info.svg" />
        <label class="font-small weight-bold">
          We are confirming your registration. This may take around 30 seconds. Thank you for your patience.
        </label>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Spin, Icon } from 'ant-design-vue'
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Spin,
    Icon
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  }
})
</script>
<style lang="less">
.loader-container {
  // global stylesheet
  .info-icon-green {
    margin-right: 8px;
  }

  .info-icon {
    width: 12px;
    height: 12px;
    margin-right: 8px;
  }

  // class stylesheet
  .notice-container {
    background: @color-blue600;
    padding: 24px;
    border-radius: 8px;
    margin-top: 18px;
  }

  .info-container {
    margin-top: 24px;

    label {
      color: @color-blue100;
    }
  }
}
</style>