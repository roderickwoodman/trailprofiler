<template>
  <!-- <div id="app"> -->
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Hola"/> -->

    <div class="container m-5 table-responsive-sm">
        <h1>Trail Data</h1>
        <form id="file-input-form">
            <p>
                <label for="my-file" class="btn btn-primary">Add GPX file(s)</label>
                <input id="my-file" style="visibility:hidden;" class="m-3" name="files[]" accept=".gpx" multiple type="file" />
            </p>
        </form>

        <span>Units: 
        <select v-model="units">
            <option value="english">English</option>
            <option value="Metric">Metric</option>
        </select>
        </span>

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
                <tr v-bind:key="index" v-for="(sequence,index) in sequences">
                    <td scope="row" v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.points[0].time | to_datestring }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }"><p class="sequence_name">{{ sequence.name }}</p><p class="sequence_filename">file: {{ sequence.filename }}</p></td>
                    <td>
                        <button v-bind:class="{ isPlotted: sequence.is_plotted }" v-on:click="clickedPlotSequence(index)">p</button>
                        <button class="btn btn-xs btn-primary" v-on:click="clickedDeleteSequence(index)">d</button>
                    </td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.total_time | to_hmm }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.total_distance | to_tenths }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.minimum_elevation | to_units }}</td>
                    <td v-bind:class="{ wasSplit: sequence.was_split }">{{ sequence.maximum_elevation | to_units }}</td>
                </tr>
            </tbody>
        </table>
    </div>
  <!-- </div> -->
</template>


<script>

export default {
  props: ['sequences'],
  data() {
    return {
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