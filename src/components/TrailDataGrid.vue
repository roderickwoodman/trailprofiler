<template>
  <!-- <div id="app"> -->
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Hola"/> -->

    <div class="container table-responsive-sm">
        <input type="checkbox" id="show_filenames" value="true" v-model="show_filenames">
        <label for="show_filenames">show filenames</label>
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th scope="col" @click="do_sort('start_time')" v-bind:class="{ sort_key: sort_key==='start_time' }">Date</th>
                    <th scope="col" @click="do_sort('name')" v-bind:class="{ sort_key: sort_key==='name' }">Name</th>
                    <th scope="col">Actions</th>
                    <th scope="col" @click="do_sort('total_time')" v-bind:class="{ sort_key: sort_key==='total_time' }">Time</th>
                    <th scope="col" @click="do_sort('total_distance')" v-bind:class="{ sort_key: sort_key==='total_distance' }">Distance ({{ units === 'english' ? 'mi' : 'km' }})</th>
                    <th scope="col" @click="do_sort('minimum_elevation')" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">Min Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                    <th scope="col" @click="do_sort('maximum_elevation')" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">Max Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="index" v-for="(sequence,index) in this.sortedSequences" v-bind:class="{ hasOutliers: sequence.has_outliers, needsSaving: !sequence.matches_file }">
                    <td scope="row" v-bind:class="{ sort_key: sort_key==='start_time' }">{{ sequence.start_time | to_datestring }}</td>
                    <td v-bind:class="{ sort_key: sort_key==='name' }">
                        <p class="sequence_name">{{ sequence.name }}</p>
                        <p v-if="show_filenames" class="sequence_filename">file: {{ sequence.filename }}</p>
                        <p v-if="sequence.has_outliers" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has outliers - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></p>
                        <p v-if="!sequence.matches_file" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence needs saving - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></p>
                    </td>
                    <td>
                        <b-button v-b-tooltip.hover title="Plot sequence" class="btn btn-sm btn-primary" v-bind:class="{ isPlotted: sequence.is_plotted }" v-on:click="clickedPlotSequence(index)"><font-awesome-icon icon="chart-line" /></b-button>
                        <b-button v-b-tooltip.hover title="Delete sequence" class="btn btn-sm btn-primary" v-on:click="clickedDeleteSequence(sequence.uuid)"><font-awesome-icon icon="trash" /></b-button>
                    </td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_time' }">{{ sequence.total_time | to_hmm }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_distance' }">{{ to_desired_units("km", sequence.total_distance) | to_tenths }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">{{ to_desired_units("m", sequence.minimum_elevation) }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">{{ to_desired_units("m", sequence.maximum_elevation) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>

export default {
    props: ['units', 'sequences', 'acknowledgeInfo', 'clickedDeleteSequence'],
    data() {
        return {
            show_filenames: false,
            sort_key: "total_distance",
            sort_dir_asc: true
        }
    },
    computed: {
        sortedSequences: function() {
            let cloned = [...this.sequences];
            let key = this.sort_key;
            let direction_asc = this.sort_dir_asc;
            return cloned.sort(function(a, b) {
                if (direction_asc === true) {
                    return (a[key] < b[key]) ? 1 : -1;
                } else {
                    return (a[key] > b[key]) ? 1 : -1;
                }
            })
        }
    },
    mounted() {
        if (localStorage.sort_key) {
            this.sort_key = JSON.parse(localStorage.sort_key);
        }
        if (localStorage.sort_dir_asc) {
            this.sort_dir_asc = JSON.parse(localStorage.sort_dir_asc);
        }
        if (localStorage.show_filenames) {
            this.show_filenames = JSON.parse(localStorage.show_filenames);
        }
    },
    watch: {
        sort_key: {
            handler: function (new_sort_key) {
                localStorage.sort_key = JSON.stringify(new_sort_key);
            }
        },
        sort_dir_asc: {
            handler: function (new_sort_dir_asc) {
                localStorage.sort_dir_asc = JSON.stringify(new_sort_dir_asc);
            }
        },
        show_filenames: {
            handler: function (new_show_filenames) {
                localStorage.show_filenames = JSON.stringify(new_show_filenames);
            }
        }
    },
    methods: {
        do_sort: function (new_sort_key) {
            if (new_sort_key !== this.sort_key) {
                this.sort_key = new_sort_key;
            } else {
                this.change_sort_dir();
            }
        },
        change_sort_dir: function() {
            this.sort_dir_asc = !this.sort_dir_asc;
        },
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
    tr.hasOutliers, tr.needsSaving {
        background-color: #ddd3ee;
    }
    .sequence_name {
        font-weight: 800;
        line-height: 0.75em;
    }
    .sequence_filename,
    .info_message {
        font-size: 0.75em;
        line-height: 0.75em;
    }
    .info_message {
        font-style: italic;
    }
    .sort_key {
        color: red;
    }
</style>