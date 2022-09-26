<script>
import { Doughnut, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: {
    data: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  mounted () {
    this.renderDoughnutChart()
  },
  methods: {
    renderDoughnutChart: function() {
      this.renderChart(this.data, this.options)
    }
  },
  watch: {
    data: function() {
      // this._chart.destroy();
      this.renderDoughnutChart();
    }
  }
}
</script>