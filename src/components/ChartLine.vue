<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins;

export default {
  extends: Line,
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
    this.renderLineChart()
  },
  methods: {
    renderLineChart: function() {
      this.renderChart(this.data, this.options)
    }
  },
  watch: {
    data: function() {
      // this._chart.destroy();
      this.renderLineChart();
    }
  }
}
</script>