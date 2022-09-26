<script>
import { Pie, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

export default {
  extends: Pie,
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
    this.renderPieChart()
  },
  methods: {
    renderPieChart: function() {
      this.renderChart(this.data, this.options)
    }
  },
  watch: {
    data: function() {
      // this._chart.destroy();
      this.renderPieChart();
    }
  }
}
</script>