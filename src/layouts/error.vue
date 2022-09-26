<template>
  <div class="oop container">
    <div class="card">
      <div class="card-body">
        <div class="oop-body fcc-container">
          <img class="oop-logo" src="@/assets/background/404.png" alt="404 logo" />
          <div class="oop-content">
            <span class="display-xlarge weight-xbold">404</span>
            <span class="font-medium weight-bold"
              >Oops! You ran out of oxygen. <br />
              The page you're looking for is now beyond <br />
              our reach. Let's get you..</span
            >
            <NuxtLink class="home-link font-medium weight-bold" to="/">Back to home page</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
export default Vue.extend({
  components: {},
  data() {
    return {}
  },
  head: {
    title: '404',
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: '404',
        id: '404 Desc'
      }
    ]
  },
  computed: {
    // ...mapState(['wallet', 'swap', 'liquidity', 'url', 'setting', 'price', 'token'])
  },
  watch: {},
  mounted() {},
  methods: {}
})
</script>
<style lang="less" scoped>
.oop.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .oop-body {
    &.fcc-container {
      @media @max-sl-mobile {
        display: block !important;
      }
    }

    .oop-content {
      display: inline-grid;
      grid-row-gap: 18px;

      @media @max-sl-mobile {
        text-align: center;
        margin-top: 18px;
      }

      .home-link {
        text-decoration: underline;
        text-underline-position: under;
      }
    }
  }
}
</style>