<template>
  <!-- <div id="app"> -->
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Hola"/> -->

    <div class="container m-5 table-responsive-sm">
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Name</th>
                    <th scope="col">Actions</th>
                    <th scope="col">Time (sec)</th>
                    <th scope="col">Distance ({{ units === 'english' ? 'mi' : 'km' }})</th>
                    <th scope="col">Min Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                    <th scope="col">Max Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="index" v-for="(sequence,index) in this.sequences">
                    <td scope="row" v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.points[0].time | to_datestring }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }"><p class="sequence_name">{{ sequence.name }}</p><p class="sequence_filename">file: {{ sequence.filename }}</p></td>
                    <td>
                        <button v-bind:class="{ isPlotted: sequence.is_plotted }" v-on:click="clickedPlotSequence(index)">p</button>
                        <button class="btn btn-xs btn-primary" v-on:click="clickedDeleteSequence(index)">d</button>
                    </td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.total_time | to_hmm }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ to_desired_units("km", sequence.total_distance) | to_tenths }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ to_desired_units("m", sequence.minimum_elevation) }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ to_desired_units("m", sequence.maximum_elevation) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  <!-- </div> -->
</template>


<script>

export default {
  props: ['units', 'sequences', 'clickedDeleteSequence'],
  data() {
    return {
    }
  },
  methods: {
    to_desired_units: function (starting_units, value) {
        if (starting_units === "m") {  // meters to feet
            if (this.units === "english") {
                return Math.round(value * 3.28084);
            } else {
                return value;
            }
        } else if (starting_units === "km") {  // kilometers to miles
            if (this.units === "english") {
                return Math.round(value * 0.621371);
            } else {
                return value;
            }
        }
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
      }
  }
}

</script>


<style scoped>
    button {
        margin: 2px 6px;
    }
    .isPlotted {
        border: 3px solid black;
        background-color: yellow;
    }
    .wasSplit {
        text-decoration: line-through;
    }
    .sequence_name {
        font-weight: 800;
        line-height: 0.75em;
    }
    .sequence_filename {
        font-size: 0.75em;
        font-style: italic;
        line-height: 0.75em;
    }
</style>