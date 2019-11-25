<template>
  <!-- <div id="app"> -->
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Hola"/> -->

    <div class="container table-responsive-sm p-0">
        <label for="show_only_plotted">
        <input type="checkbox" id="show_only_plotted" value="false" v-model="show_only_plotted">
			show row only if plotted</label>
        <label for="show_filenames">
			<input type="checkbox" id="show_filenames" value="false" v-model="show_filenames">
			show filenames of each row</label>
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th scope="col" class="sortable" @click="do_sort('start_time')" v-bind:class="{ sort_key: sort_key==='start_time' }">Date</th>
                    <th scope="col" class="sortable" @click="do_sort('name')" v-bind:class="{ sort_key: sort_key==='name' }">Name</th>
                    <th scope="col">Actions</th>
                    <th scope="col" class="sortable" @click="do_sort('total_time')" v-bind:class="{ sort_key: sort_key==='total_time' }">Time</th>
                    <th scope="col" class="sortable" @click="do_sort('total_distance')" v-bind:class="{ sort_key: sort_key==='total_distance' }">Distance ({{ units === 'english' ? 'mi' : 'km' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('average_pace')" v-bind:class="{ sort_key: sort_key==='average_pace' }">Pace ({{ units === 'english' ? 'mph' : 'kph' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('minimum_elevation')" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">Min Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('maximum_elevation')" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">Max Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="sequence.uuid" v-for="sequence in sortedSequences" v-bind:class="{ acknowledged: sequence.acknowledged, hasOutliers: sequence.has_outliers && !sequence.acknowledged, needsSaving: !sequence.matches_file && !sequence.acknowledged }">
                    <td scope="row" v-bind:class="{ sort_key: sort_key==='start_time' }">{{ sequence.start_time | to_datestring }}</td>
                    <td v-bind:class="{ sort_key: sort_key==='name' }">
                        <span class="sequence_name" :class="plotted_class(sequence.uuid)">{{ sequence.name }}</span>
                        <span v-if="show_filenames" class="sequence_filename">file: {{ sequence.filename_printed }}</span>
                        <span v-if="sequence.has_outliers && !sequence.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has outliers - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></span>
                        <span v-if="!sequence.matches_file && !sequence.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> please save this segment to its own file - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></span>
                    </td>
                    <td class="actions">
                        <b-button v-if="!sequence.is_plotted" v-b-tooltip.hover title="Plot sequence" class="btn btn-sm btn-primary" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="chart-line" /></b-button>
                        <b-button v-if="sequence.is_plotted" v-b-tooltip.hover title="Remove from plot" class="btn btn-sm btn-primary" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="ban" /></b-button>
                        <b-button v-if="!sequence.matches_file" v-b-tooltip.hover title="Save to file" class="btn btn-sm btn-primary" v-on:click="clickedSaveSequence(sequence.uuid)"><font-awesome-icon icon="save" /></b-button>
                        <b-button v-b-tooltip.hover title="Remove from browser" class="btn btn-sm btn-primary" v-on:click="clickedDeleteSequence(sequence.uuid)"><font-awesome-icon icon="trash" /></b-button>
                    </td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_time' }">{{ sequence.total_time | to_hmm }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_distance' }">{{ to_desired_units("km", sequence.total_distance) | to_tenths }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='average_pace' }">{{ to_desired_units("kph", sequence.average_pace) | to_tenths }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">{{ to_desired_units("m", sequence.minimum_elevation) }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">{{ to_desired_units("m", sequence.maximum_elevation) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>

export default {
	props: ['units', 'sequences', 'plot_order', 'plotted_labels', 'acknowledgeInfo', 'clickedPlotSequence', 'clickedSaveSequence', 'clickedDeleteSequence'],
	data() {
		return {
			show_filenames: false,
			show_only_plotted: false,
			sort_key: 'total_distance',
			sort_dir_asc: true
		};
	},
	computed: {
		sortedSequences: function() {
			let cloned = [...this.sequences];
			let showing = [];
			if (this.show_only_plotted) {
				showing = cloned.filter(seq => seq.is_plotted === true);
			} else {
				showing = cloned;
			}
			let key = this.sort_key;
			let direction_asc = this.sort_dir_asc;
			return showing.sort(function(a, b) {
				if (direction_asc === true) {
					return (a[key] < b[key]) ? 1 : -1;
				} else {
					return (a[key] > b[key]) ? 1 : -1;
				}
			});
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
		if (localStorage.show_only_plotted) {
			this.show_only_plotted = JSON.parse(localStorage.show_only_plotted);
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
		},
		show_only_plotted: {
			handler: function (new_show_only_plotted) {
				localStorage.show_only_plotted = JSON.stringify(new_show_only_plotted);
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
			if (starting_units === 'm') {  // meters to feet
				if (this.units === 'englsh') {
					return value * 3.28084;
				} else {
					return value;
				}
			} else if (starting_units === 'km' || starting_units === 'kph') {  // kilometers to miles OR kph to mph
				if (this.units === 'english') {
					return value * 0.621371;
				} else {
					return value;
				}
			}
		},
		plotted_class: function (sequence_uuid) {
			let plot_order_index = this.plot_order.findIndex( uuid => uuid === sequence_uuid);
			if (plot_order_index === -1) {
				return 'not_plotted';
			} else {
				return this.plotted_labels[plot_order_index];
			}
		}
	},
	filters: {
		to_datestring: function (epoch) {
			if (!epoch) return '';
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
			return (Math.round(10*parseFloat(number))/10).toFixed(1);
		}
	}
};

</script>


<style scoped>
    button {
        margin: 2px 2px;
    }
	label {
		margin: 5px 0;
		display: block;
	}
	label, input {
		max-width: 250px;
		cursor: pointer;
	}
    .isPlotted {
        border: 3px solid black;
        background-color: yellow;
    }
    tr.hasOutliers, tr.needsSaving {
        background-color: #ddd3ee;
    }
    tr.hasOutliers:hover, tr.needsSaving:hover {
        background-color: #b5a0da;
    }
    tr.acknowledged,
    tr.hasOutliers.acknowledged, tr.needsSaving.acknowledged {
        background-color: white;
    }
    tr.acknowledged:hover,
    tr.hasOutliers.acknowledged:hover, tr.needsSaving.acknowledged:hover {
        background-color: #dee2e6;
    }
	tr > td {
		vertical-align: middle;
	}
	td.actions {
		display: flex;
		justify-content: center;
	}
    .sequence_name {
        font-weight: 800;
        line-height: 1em;
    }
    .sequence_name,
    .sequence_filename,
    .info_message {
        padding: 5px 5px;
        display: block;
    }
    .sequence_filename,
    .info_message {
        font-size: 0.75em;
        line-height: 0.75em;
    }
    .info_message {
        font-style: italic;
    }
    th.sortable {
        cursor: pointer;
    }
    th.sortable:hover {
        color: red;
        background-color: lightpink;
    }
    .sort_key {
        color: red;
    }
</style>