<template>
	<div>

		<h1 v-if="show_only_plotted">Sequences ({{ sortedSequences.length }} of {{ sequences.length }} shown)</h1>
		<h1 v-if="!show_only_plotted">Sequences ({{ sequences.length }})</h1>
		<div class="container table-responsive-sm p-0">
			<label for="show_only_plotted">
				<input type="checkbox" id="show_only_plotted" value="false" v-model="show_only_plotted">
				show row only if plotted</label>
			<label for="show_details">
				<input type="checkbox" id="show_details" value="false" v-model="show_details">
				show details of each row</label>
			<label for="show_image_specs">
				<input type="checkbox" id="show_image_specs" value="false" v-model="show_image_specs">
				show image specs</label>
			<table class="table table-sm">
				<thead>
					<tr>
						<th scope="col" class="sortable" @click="do_sort('start_time')">Date</th>
						<th scope="col" class="sortable" @click="do_sort('name')">Name</th>
						<th scope="col"></th>
						<th scope="col">
							<HeaderRowForNumbers :units="units" :do_sort="do_sort" />
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-bind:key="sequence.uuid" v-for="sequence in sortedSequences" v-bind:class="{ hasInfo: !sequence.matches_file, acknowledged: sequence.acknowledged }">
						<td class="hoverable_cell" @mouseover="hoveringon_datetime_uuid = sequence.uuid" @mouseleave="hoveringon_datetime_uuid = null">
							<div>
								<div class="datetimecontent_title">
									<span v-if="time_format !== 'epoch'">{{ epoch_to_datestring(sequence.start_time) }}</span>
									<span v-if="time_format === 'epoch' && !show_details">{{ sequence.start_time }}</span>
									<div class="datetimecontent_actions" v-show="hoveringon_datetime_uuid === sequence.uuid">
										<b-button v-if="editing_sequence_datetime!==sequence.uuid" v-b-tooltip.hover title="Edit datetime" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequenceDatetime(sequence.uuid)"><font-awesome-icon icon="edit" /></b-button>
										<b-button v-if="editing_sequence_datetime===sequence.uuid" v-b-tooltip.hover title="Cancel edit datetime" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequenceDatetime(sequence.uuid)"><font-awesome-icon icon="edit" /></b-button>
									</div>
								</div>
							</div>
							<div class="datetimecontent_details">
								<span v-if="time_format !== 'epoch' && show_details" class="sequence_details">start: {{ epoch_to_timestring(sequence.start_time) }}</span>
								<span v-if="time_format !== 'epoch' && show_details" class="sequence_details">end: {{ epoch_to_timestring(sequence.end_time) }}</span>
								<span v-if="time_format === 'epoch' && show_details" class="sequence_details">start: {{ sequence.start_time }}</span>
								<span v-if="time_format === 'epoch' && show_details" class="sequence_details">end: {{ sequence.end_time }}</span>
							</div>
							<form v-if="editing_sequence_datetime===sequence.uuid" @submit="clickedSubmitDatetimeEdits">
								<input name="new_datetime_edits" class="sequence_datetime editing" v-model="new_datetime_edits" />
								<input name="sequence_uuid" type="hidden" :value="sequence.uuid" />
							</form>
						</td>
						<td class="hoverable_cell" @mouseover="hoveringon_uuid = sequence.uuid" @mouseleave="hoveringon_uuid = null">
							<div :class="plotted_classes(sequence.uuid)">
								<div class="namecontent_title">
									<span v-if="editing_uuid!==sequence.uuid" class="sequence_name">{{ sequence.name }}</span>
									<form v-if="editing_uuid===sequence.uuid" @submit="clickedSubmitEdits">
										<input name="new_name_edits" class="sequence_name editing" v-model="new_name_edits" />
										<input name="sequence_uuid" type="hidden" :value="sequence.uuid" />
									</form>
									<div class="namecontent_actions" v-show="hoveringon_uuid === sequence.uuid">
										<b-button v-if="editing_uuid!==sequence.uuid" v-b-tooltip.hover title="Edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequence(sequence.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(sequence.uuid)" /></b-button>
										<b-button v-if="editing_uuid===sequence.uuid" v-b-tooltip.hover title="Cancel edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditSequence(sequence.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(sequence.uuid)" /></b-button>
										<b-button v-if="!sequence.is_plotted" v-b-tooltip.hover title="Plot sequence" class="btn btn-sm bg-transparent" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="chart-line" :class="plotted_classes(sequence.uuid)" /></b-button>
										<b-button v-if="sequence.is_plotted" v-b-tooltip.hover title="Remove from plot" class="btn btn-sm bg-transparent" v-on:click="clickedPlotSequence(sequence.uuid)"><font-awesome-icon icon="ban" :class="plotted_classes(sequence.uuid)" /></b-button>
										<b-button v-if="!sequence.matches_file" v-b-tooltip.hover title="Save to file" class="btn btn-sm bg-transparent" v-on:click="clickedSaveSequence(sequence.uuid)"><font-awesome-icon icon="save" :class="plotted_classes(sequence.uuid)" /></b-button>
										<b-button v-b-tooltip.hover title="Remove from browser" class="btn btn-sm bg-transparent" v-on:click="clickedDeleteSequence(sequence.uuid)"><font-awesome-icon icon="trash" :class="plotted_classes(sequence.uuid)" /></b-button>
									</div>
								</div>
							</div>
							<div class="namecontent_details">
								<span v-if="show_details" class="sequence_details">file: {{ sequence.filename_printed }}</span>
								<span v-if="show_details" class="sequence_details">creator: {{ sequence.creator }}</span>
								<span v-if="show_details" class="sequence_details">link: <a :href="sequence.metadata_link">{{ sequence.metadata_linktext }}</a></span>
								<span v-if="!sequence.matches_file && !sequence.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> please save this segment and re-import it - <a href="" v-on:click="acknowledgeInfo(sequence.uuid)">Dismiss</a></span>
							</div>
						</td>
						<td class="photorow_actions" :set="[shown_photo_count=indexed_photos[sequence.uuid].filter(photo => !excluded_cameras.includes(photo.camera_model)).length, total_photo_count=indexed_photos[sequence.uuid].length]">
							<b-button v-if="!sequence.show_photos" class="show_photos btn btn-sm bg-transparent" v-b-tooltip.hover title="Show photos" v-on:click="toggleShowPhotos(sequence.uuid)">
								<font-awesome-icon icon="camera"></font-awesome-icon>
								<div v-if="shown_photo_count === total_photo_count">({{ shown_photo_count }})</div>
								<div v-if="shown_photo_count !== total_photo_count">({{ shown_photo_count }} of {{ total_photo_count }})</div>
							</b-button>
							<b-button v-if="sequence.show_photos" class="show_photos btn btn-sm bg-transparent" v-b-tooltip.hover title="Show data" v-on:click="toggleShowPhotos(sequence.uuid)">
								<font-awesome-icon icon="table"></font-awesome-icon>
								<div v-if="shown_photo_count === total_photo_count">({{ shown_photo_count }})</div>
								<div v-if="shown_photo_count !== total_photo_count">({{ shown_photo_count }} of {{ total_photo_count }})</div>
							</b-button>
						</td>
						<td v-if="sequence.show_photos" class="details_columns">
							<RowOfPhotos :row_photos="indexed_photos[sequence.uuid]" :excluded_cameras="excluded_cameras" :time_format="time_format" :epoch_to_datestring="epoch_to_datestring" :epoch_to_timestring="epoch_to_timestring" :show_date="false" :show_details="show_details" :show_image_specs="show_image_specs" :toggleCameraInclusion="toggleCameraInclusion" :clickedDeletePhoto="clickedDeletePhoto" />
						</td>
						<td v-if="!sequence.show_photos" class="details_columns">
							<RowOfNumbers :sequence="sequence" :units="units" :epoch_to_timestring="epoch_to_timestring" :epoch_to_datestring="epoch_to_datestring" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div v-if="photo_count" class="container table-responsive-sm p-0">
			<table class="table table-sm">
				<thead>
					<tr :set="[shown_unindexed_photo_count=unindexed_photos.filter(photo => !excluded_cameras.includes(photo.camera_model)).length, total_unindexed_photo_count=unindexed_photos.length]">
						<th v-if="shown_unindexed_photo_count === total_unindexed_photo_count">Unassigned Photos ({{ shown_unindexed_photo_count }})</th>
						<th v-if="shown_unindexed_photo_count !== total_unindexed_photo_count">Unassigned Photos ({{ shown_unindexed_photo_count }} of {{ total_unindexed_photo_count }} shown)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<RowOfPhotos :row_photos="unindexed_photos" :excluded_cameras="excluded_cameras" :time_format="time_format" :epoch_to_datestring="epoch_to_datestring" :epoch_to_timestring="epoch_to_timestring" :show_date="true" :show_details="show_details" :show_image_specs="show_image_specs" :toggleCameraInclusion="toggleCameraInclusion" :clickedDeletePhoto="clickedDeletePhoto" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>

	</div>
</template>


<script>

import HeaderRowForNumbers from './HeaderRowForNumbers.vue';
import RowOfNumbers from './RowOfNumbers.vue';
import RowOfPhotos from './RowOfPhotos.vue';

export default {
	props: ['sequences', 'indexed_photos', 'unindexed_photos', 'photo_count', 'excluded_cameras', 'units', 'time_format', 'epoch_to_timestring', 'epoch_to_datestring', 'plotted_classes', 'acknowledgeInfo', 'submitSequenceEdits', 'submitSequenceDatetimeEdits', 'clickedPlotSequence', 'clickedSaveSequence', 'clickedDeleteSequence', 'clickedDeletePhoto', 'toggleShowPhotos', 'toggleCameraInclusion'],
	components: {
		HeaderRowForNumbers,
		RowOfNumbers,
		RowOfPhotos
	},
	data() {
		return {
			show_details: false,
			show_image_specs: false,
			show_only_plotted: false,
			sort_key: 'total_distance',
			sort_dir_asc: true,
			editing_sequence_datetime: null,
			editing_uuid: null,
			new_datetime_edits: '',
			new_name_edits: '',
			hoveringon_datetime_uuid: null,
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
				if (this.units === 'english') {
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
		clickedEditSequence: function(sequence_uuid) {
			let sequence_index = this.sequences.findIndex(sequence => sequence.uuid === sequence_uuid);
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
		},
		clickedEditSequenceDatetime: function(sequence_uuid) {
			let sequence_index = this.sequences.findIndex(sequence => sequence.uuid === sequence_uuid);
			if (this.editing_sequence_datetime !== sequence_uuid) {
				this.editing_sequence_datetime = sequence_uuid;
				this.new_datetime_edits = this.sequences[sequence_index].start_time;
			} else {
				this.editing_sequence_datetime = null;
				this.new_datetime_edits = '';
			}
		},
		clickedSubmitDatetimeEdits: function(e) {
			this.editing_sequence_datetime = null;
			this.new_datetime_edits = '';
			this.submitSequenceDatetimeEdits(e);
		},
		seconds_to_hms: function (seconds) {
			const leadingZero = (num) => (0 + num.toString()).slice(-2);
			let tot = Number(seconds);
			let d = Math.floor(tot / 86400);
			let h = Math.floor(tot % 86400 / 3600);
			let m = Math.floor(tot % 86400 % 3600 / 60);
			let s = Math.floor(tot % 86400 % 3600 % 60);
			if (m > 0) {
				s = leadingZero(s);
			}
			if (h > 0) {
				m = leadingZero(m);
			}
			if (d > 0) {
				h = leadingZero(h);
			}
			let retval = '';
			if (d !== 0) {
				retval += d + 'd ';
			}
			if (h !== 0) {
				retval += h + 'h ';
			}
			if (m !== 0) {
				retval += m + 'm ';
			}
			if (s !== 0) {
				retval += s + 's ';
			}
			return retval;
		},
		seconds_to_hm: function (seconds) {
			let hms = this.seconds_to_hms(seconds);
			return hms.substring(0,hms.length-5);
		}
	},
	filters: {
		to_tenths: function (number) {
			return (Math.round(10*parseFloat(number))/10).toFixed(1);
		},
		round_it: function (number) {
			return Math.round(parseFloat(number));
		}
	}
};

</script>


<style scoped>
	.datetimecontent_actions button,
	.namecontent_actions button {
		margin: 2px 2px;
	}
	.datetimecontent_actions button {
		color: black;
	}
	.photorow_actions {
		margin: 0;
		padding: 0;
	}
	.photorow_actions button {
		min-width: 65px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.show_photos {
		margin: 2px;
		padding: 8px;
		border: 0;
		color: black;
	}
	.show_photos button {
		color: black;
		border: 0;
		background: transparent;
	}
	.show_photos:hover {
		color: black;
		border: 1px solid black;
		border-radius: 5px;
		cursor: pointer;
	}
	label {
		margin: 5px 0;
		max-width: 250px;
		cursor: pointer;
	}
	tr > td {
		vertical-align: middle;
	}
	.datetimecontent_actions,
	.namecontent_actions {
		position: absolute;
		right: 5px;
		top: 5px;
		width: 25%;
		display: flex;
		justify-content: flex-end;
	}
	.datetimecontent_title,
	.namecontent_title {
		position: relative;
		width: 100%;
	}
	.sequence_datetime,
	.sequence_name {
		font-weight: 800;
	}
	.sequence_datetime.editing,
	.sequence_name.editing {
		border: 5px solid red;
		padding: 2px 2px;
		width: 100%;
	}
	.sequence_details {
		padding: 4px 4px;
		display: block;
	}
	.sortable {
		cursor: pointer;
	}
	.details_columns {
		max-width: 600px;
		min-width: 600px;
	}
</style>