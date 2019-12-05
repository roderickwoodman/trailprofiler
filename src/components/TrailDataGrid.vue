<template>

    <div class="container table-responsive-sm p-0">
        <label for="show_only_plotted">
        <input type="checkbox" id="show_only_plotted" value="false" v-model="show_only_plotted">
			show row only if plotted</label>
        <label for="show_details">
			<input type="checkbox" id="show_details" value="false" v-model="show_details">
			show details of each row</label>
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th scope="col" class="sortable" @click="do_sort('start_time')" v-bind:class="{ sort_key: sort_key==='start_time' }">Date</th>
                    <th scope="col" class="sortable" @click="do_sort('name')" v-bind:class="{ sort_key: sort_key==='name' }">Name</th>
                    <th scope="col" class="sortable" @click="do_sort('total_time')" v-bind:class="{ sort_key: sort_key==='total_time' }">Time</th>
                    <th scope="col" class="sortable" @click="do_sort('total_distance')" v-bind:class="{ sort_key: sort_key==='total_distance' }">Distance ({{ units === 'english' ? 'mi' : 'km' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('average_pace')" v-bind:class="{ sort_key: sort_key==='average_pace' }">Pace ({{ units === 'english' ? 'min/mi' : 'min/km' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('minimum_elevation')" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">Min Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                    <th scope="col" class="sortable" @click="do_sort('maximum_elevation')" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">Max Elev. ({{ units === 'english' ? 'ft' : 'm' }})</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="sequence.uuid" v-for="sequence in sortedSequences" v-bind:class="{ acknowledged: sequence.acknowledged && !sequence.acknowledged, needsSaving: !sequence.matches_file && !sequence.acknowledged }">
                    <td scope="row" v-bind:class="{ sort_key: sort_key==='start_time' }">{{ sequence.start_time | to_datestring_from_epoch }}
						<span v-if="show_details" class="sequence_details">start: {{ to_timestring_from_epoch(sequence.start_time) }}</span>
						<span v-if="show_details" class="sequence_details">end: {{ to_timestring_from_epoch(sequence.end_time) }}</span>
					</td>
                    <td v-bind:class="{ sort_key: sort_key==='name' }" class="name_container" @mouseover="hoveringon_uuid = sequence.uuid" @mouseleave="hoveringon_uuid = null">
						<div class="namecontent_colored" :class="plotted_classes(sequence.uuid)">
							<div class="namecontent_title">
								<span v-if="editing_uuid!==sequence.uuid" class="sequence_name">{{ sequence.name }}</span>
								<form v-if="editing_uuid===sequence.uuid" @submit="clickedSubmitEdits">
									<input name="new_name_edits" class="sequence_name editing" v-model="new_name_edits" />
									<input name="sequence_uuid" type="hidden" :value="sequence.uuid" />
								</form>
							</div>
							<div class="namecontent_actions" v-show="hoveringon_uuid === sequence.uuid">
								<b-button v-if="editing_uuid!==sequence.uuid" v-b-tooltip.hover title="Edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequence(sequence.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(sequence.uuid)" /></b-button>
								<b-button v-if="editing_uuid===sequence.uuid" v-b-tooltip.hover title="Cancel edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequence(sequence.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(sequence.uuid)" /></b-button>
								<b-button v-if="!sequence.is_plotted" v-b-tooltip.hover title="Plot sequence" class="btn btn-sm bg-transparent" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="chart-line" :class="plotted_classes(sequence.uuid)" /></b-button>
								<b-button v-if="sequence.is_plotted" v-b-tooltip.hover title="Remove from plot" class="btn btn-sm bg-transparent" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="ban" :class="plotted_classes(sequence.uuid)" /></b-button>
								<b-button v-if="!sequence.matches_file" v-b-tooltip.hover title="Save to file" class="btn btn-sm bg-transparent" v-on:click="clickedSaveSequence(sequence.uuid)"><font-awesome-icon icon="save" :class="plotted_classes(sequence.uuid)" /></b-button>
								<b-button v-b-tooltip.hover title="Remove from browser" class="btn btn-sm bg-transparent" v-on:click="clickedDeleteSequence(sequence.uuid)"><font-awesome-icon icon="trash" :class="plotted_classes(sequence.uuid)" /></b-button>
							</div>
						</div>
						<div class="namecontent_details">
							<span v-if="show_details" class="sequence_details">file: {{ sequence.filename_printed }}</span>
							<span v-if="show_details" class="sequence_details">creator: {{ sequence.creator }}</span>
							<span v-if="show_details" class="sequence_details">link: <a :href="sequence.metadata_link">{{ sequence.metadata_linktext }}</a></span>
							<span v-if="sequence.has_outliers && !sequence.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has outliers - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></span>
							<span v-if="!sequence.matches_file && !sequence.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> please save this segment to its own file - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></span>
						</div>
                    </td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_time' }">{{ sequence.total_time | to_hmm }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='total_distance' }">{{ to_desired_units("km", sequence.total_distance) | to_tenths }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='average_pace' }">{{ to_desired_units("secsperkm", sequence.average_pace) | to_timeformat }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='minimum_elevation' }">{{ to_desired_units("m", sequence.minimum_elevation) }}</td>
                    <td class="pr-5 text-right" v-bind:class="{ sort_key: sort_key==='maximum_elevation' }">{{ to_desired_units("m", sequence.maximum_elevation) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>

export default {
	props: ['units', 'time_format', 'sequences', 'plot_order', 'plotted_labels', 'acknowledgeInfo', 'submitSequenceEdits', 'clickedPlotSequence', 'clickedSaveSequence', 'clickedDeleteSequence'],
	data() {
		return {
			show_details: false,
			show_only_plotted: false,
			sort_key: 'total_distance',
			sort_dir_asc: true,
			editing_uuid: null,
			new_name_edits: '',
			hoveringon_uuid: null
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
		if (localStorage.show_details) {
			this.show_details = JSON.parse(localStorage.show_details);
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
		show_details: {
			handler: function (new_show_details) {
				localStorage.show_details = JSON.stringify(new_show_details);
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
			} else if (starting_units === 'km') {  // kilometers to miles
				if (this.units === 'english') {
					return value * 0.621371;
				} else {
					return value;
				}
			} else if (starting_units === 'secsperkm') {  // seconds per km to seconds per mi
				if (this.units === 'english') {
					return value * 1.60934;
				} else {
					return value;
				}
			}
		},
		to_timestring_from_epoch: function (epoch) {
			if (!epoch) return '';
			const leadingZero = (num) => (0 + num.toString()).slice(-2);
			let date = new Date(epoch);
			let hours = (this.time_format === 'ampm') ? (date.getHours() + 11) % 12 + 1 : date.getHours();
			let minutes = date.getMinutes();
			let suffix = (this.time_format !== 'ampm') ? '' : (date.getHours() < 12) ? 'AM' : 'PM';
			return leadingZero(hours) + ':' + leadingZero(minutes) + ' ' + suffix;
		},
		plotted_classes: function (sequence_uuid) {
			let plot_order_index = this.plot_order.findIndex( uuid => uuid === sequence_uuid);
			if (plot_order_index === -1) {
				return 'not_plotted';
			} else {
				return this.plotted_labels[plot_order_index];
			}
		},
		clickedEditSequence: function(sequence_uuid) {
			let sequence_index = this.sequences.findIndex( sequence => sequence.uuid === sequence_uuid);
			if (this.editing_uuid !== sequence_uuid) {
				this.editing_uuid = sequence_uuid;
				this.new_name_edits = this.sequences[sequence_index].name;
			} else {
				this.editing_uuid = null;
				this.new_name_edits = '';
			}
		},
		clickedSubmitEdits: function(e) {
			this.editing_uuid = null;
			this.new_name_edits = '';
			this.submitSequenceEdits(e);
		}
	},
	filters: {
		to_datestring_from_epoch: function (epoch) {
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
		},
		to_timeformat: function (total_seconds) {
			let retval = '';
			let seconds_digits = Math.round(total_seconds % 60);
			let total_minutes = Math.floor(total_seconds / 60);
			let minutes_digits = Math.round(total_minutes % 60);
			let hours = Math.floor(total_minutes / 60);
			if (hours > 0) {
				retval += hours + ':';
			}
			if (minutes_digits < 10 && hours > 0) {
				minutes_digits = '0' + minutes_digits;
			}
			retval += minutes_digits + ':';
			if (seconds_digits < 10) {
				seconds_digits = '0' + seconds_digits;
			}
			retval += seconds_digits;
			return retval;
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
	.btn.btn-sm {
		border: 0;
		margin: 0;
		padding: 3px;
	}
	.name_container {
		position: relative;
	}
	.namecontent_actions {
		position: absolute;
		right: 5px;
		top: 5px;
		width: 25%;
		display: flex;
		justify-content: flex-end;
	}
	.namecontent_title {
		width: 75%;
	}
    .sequence_name {
        font-weight: 800;
        line-height: 1em;
    }
	.sequence_name.editing {
		border: 5px solid red;
        padding: 2px 2px;
		width: 100%;
	}
    .sequence_details {
        padding: 4px 4px;
        display: block;
    }
    .sequence_name,
    .info_message {
        padding: 7px 7px;
        display: block;
    }
    .sequence_details,
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