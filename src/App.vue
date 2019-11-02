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
  filters: {
      to_datestring: function (epoch) {
          if (!epoch) return ''
          let converted = new Date(epoch);
          return converted.toDateString();
      },
      to_hmm: function (seconds) {
          let tot = Number(seconds);
          let d = Math.floor(tot / 86400);
          let h = Math.floor(tot % 86400 / 3600);
          let m = Math.floor(tot % 86400 % 3600 / 60);
          if (d < 1 && m < 10) {
              m = '0' + m;
          }
          if (d > 0) {
              return d + 'd ' + h + 'h ' + m + 'm';
          } else {
              return h + ':' + m;
          }
      },
      to_tenths: function (number) {
          return (Math.round(10*number)/10).toFixed(1);
      },
      to_units: function (meters) {
          if (this.units === "english") {
              return Math.round(meters * 3.28084);
          } else {
              return meters;
          }
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
