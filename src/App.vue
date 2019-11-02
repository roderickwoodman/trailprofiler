<template>
  <div id="app">
    <TrailDataChart />
    <TrailDataGrid />
  </div>
</template>

<script>
import TrailDataChart from './components/TrailDataChart.vue'
import TrailDataGrid from './components/TrailDataGrid.vue'

export default {
  name: 'app',
  components: {
    TrailDataChart,
    TrailDataGrid
  },
  data() {
    return {
      sequences: [],
      units: 'english',
      chart_data: {}, //default_data,
      chart_options: {} //default_options
    }
  },
  mounted() {
      if (localStorage.sequences) {
          this.sequences = JSON.parse(localStorage.sequences);
          // for ([index,sequence] of this.sequences.entries()) {
          //     if (sequence.is_plotted) {
          //         console.log("plotting: ", index);
          //         // this.clickedPlotSequence(index);
          //     }
          // }
      }
  },
  watch: {
      sequences: {
          handler: function (new_sequences) {
              localStorage.sequences = JSON.stringify(new_sequences);
          },
          deep: true
      }
  },
  methods: {
    //   clickedPlotSequence: function (sequence_num) {
    //       if (this.sequences[sequence_num].is_plotted) {
    //           removeSequenceFromChart(sequence_num);
    //       } else {
    //           addSequenceToChart(this.sequences[sequence_num]);
    //       }
    //       this.sequences[sequence_num].is_plotted = !this.sequences[sequence_num].is_plotted;
    //   },
    //   clickedDeleteSequence: function (sequence_num) {
    //       removeSequenceFromChart(sequence_num);
    //       this.sequences.splice(sequence_num, 1);
    //   }
  },
  computed: {
    //   distances: function() {
    //       let distances = [];
    //       let factor = (this.units === 'english') ? 0.621371 : 1;
    //       for (let s of this.sequences) {
    //           distances.push(s.total_distance * factor);
    //       }
    //   }
  }
}
</script>

<style scoped>
</style>
