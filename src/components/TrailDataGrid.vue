<template>
	<div>

		<div class="container table-responsive-sm p-0">
			<div class="table_header_section">
				<div class="table_title">
					<h1 v-if="show_only_plotted">Trails ({{ sortedTrails.length }} of {{ trails.length }} shown)</h1>
					<h1 v-if="!show_only_plotted">Trails ({{ trails.length }})</h1>
				</div>
				<div class="import_buttons">
					<form id="gpx-file-input-form">
						<label for="my-gpx-files" class="btn btn-transparent">Import GPS Data <font-awesome-icon icon="upload" /></label>
						<input @change="add_trails" id="my-gpx-files" name="files[]" accept=".gpx" multiple type="file" />
					</form>
					<form id="image-file-input-form">
						<label for="my-image-files" class="btn btn-transparent">Import Images <font-awesome-icon icon="upload" /></label>
						<input @change="add_images" id="my-image-files" name="files[]" accept=".jpg" multiple type="file" />
					</form>
				</div>
				<div class="view_checkbox_buttons">
					<input type="checkbox" id="show_only_plotted" class="chk_btn" value="false" v-model="show_only_plotted" hidden>
					<label for="show_only_plotted"><font-awesome-icon icon="chart-line"></font-awesome-icon></label>
					<input type="checkbox" id="show_details" class="chk_btn" value="false" v-model="show_details" hidden>
					<label for="show_details"><font-awesome-icon icon="align-left"></font-awesome-icon></label>
					<input type="checkbox" id="show_image_specs" class="chk_btn" value="false" v-model="show_image_specs" hidden>
					<label for="show_image_specs"><font-awesome-icon icon="camera-retro"></font-awesome-icon></label>
				</div>
			</div>
			<table class="table table-sm">
				<thead>
					<tr>
						<th scope="col" class="datecol sortable" @click="do_sort('start_time')">Date</th>
						<th scope="col" class="namecol sortable" @click="do_sort('name')">Name</th>
						<th scope="col" class="actioncol">
							<span class="text-center linebreak">Photos</span>
							<span v-if="photo_count === shown_photo_count" class="text-center linebreak">{{ photo_count }}</span>
							<span v-if="photo_count !== shown_photo_count" class="text-center linebreak">{{ shown_photo_count }} of {{ photo_count }}</span>
						</th>
						<th scope="col" class="variable_content_columns">
							<div>
								<HeaderRowForNumbers :units="units" :do_sort="do_sort" />
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-bind:key="trail.uuid" v-for="trail in sortedTrails" v-bind:class="{ hasInfo: !trail.matches_file, acknowledged: trail.acknowledged }">
						<td class="hoverable_cell" @mouseover="hoveringon_datetime_uuid = trail.uuid" @mouseleave="hoveringon_datetime_uuid = null">
							<div>
								<div class="datetimecontent_title">
									<span v-if="time_format !== 'epoch'">{{ epoch_to_datestring(trail.start_time) }}</span>
									<span v-if="time_format === 'epoch' && !show_details">{{ trail.start_time }}</span>
									<div class="datetimecontent_actions" v-show="hoveringon_datetime_uuid === trail.uuid">
										<b-button v-if="editing_trail_datetime!==trail.uuid" v-b-tooltip.hover title="Edit datetime" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditTrailDatetime(trail.uuid)"><font-awesome-icon icon="edit" /></b-button>
										<b-button v-if="editing_trail_datetime===trail.uuid" v-b-tooltip.hover title="Cancel edit datetime" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditTrailDatetime(trail.uuid)"><font-awesome-icon icon="edit" /></b-button>
									</div>
								</div>
							</div>
							<div class="datetimecontent_details">
								<span v-if="time_format !== 'epoch' && show_details" class="trail_details">start: {{ epoch_to_timestring(trail.start_time) }}</span>
								<span v-if="time_format !== 'epoch' && show_details" class="trail_details">end: {{ epoch_to_timestring(trail.end_time) }}</span>
								<span v-if="time_format === 'epoch' && show_details" class="trail_details">start: {{ trail.start_time }}</span>
								<span v-if="time_format === 'epoch' && show_details" class="trail_details">end: {{ trail.end_time }}</span>
							</div>
							<form v-if="editing_trail_datetime===trail.uuid" @submit="clickedSubmitDatetimeEdits">
								<input name="new_datetime_edits" class="trail_datetime editing" v-model="new_datetime_edits" />
								<input name="trail_uuid" type="hidden" :value="trail.uuid" />
							</form>
						</td>
						<td class="hoverable_cell" @mouseover="hoveringon_uuid = trail.uuid" @mouseleave="hoveringon_uuid = null">
							<div :class="plotted_classes(trail.uuid)">
								<div class="namecontent_title">
									<span v-if="editing_uuid!==trail.uuid" class="trail_name">{{ trail.name }}</span>
									<form v-if="editing_uuid===trail.uuid" @submit="clickedSubmitEdits">
										<input name="new_name_edits" class="trail_name editing" v-model="new_name_edits" />
										<input name="trail_uuid" type="hidden" :value="trail.uuid" />
									</form>
									<div class="namecontent_actions" v-show="hoveringon_uuid === trail.uuid">
										<b-button v-if="editing_uuid!==trail.uuid" v-b-tooltip.hover title="Edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditTrail(trail.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(trail.uuid)" /></b-button>
										<b-button v-if="editing_uuid===trail.uuid" v-b-tooltip.hover title="Cancel edit name" class="btn btn-sm btn-primary bg-transparent" v-on:click="clickedEditTrail(trail.uuid)"><font-awesome-icon icon="edit" :class="plotted_classes(trail.uuid)" /></b-button>
										<b-button v-if="!trail.is_plotted" v-b-tooltip.hover title="Plot trail" class="btn btn-sm bg-transparent" v-on:click="clickedPlotTrail(trail.uuid)"><font-awesome-icon icon="chart-line" :class="plotted_classes(trail.uuid)" /></b-button>
										<b-button v-if="trail.is_plotted" v-b-tooltip.hover title="Remove from plot" class="btn btn-sm bg-transparent" v-on:click="clickedPlotTrail(trail.uuid)"><font-awesome-icon icon="ban" :class="plotted_classes(trail.uuid)" /></b-button>
										<b-button v-if="!trail.matches_file" v-b-tooltip.hover title="Save to file" class="btn btn-sm bg-transparent" v-on:click="clickedSaveTrail(trail.uuid)"><font-awesome-icon icon="save" :class="plotted_classes(trail.uuid)" /></b-button>
										<b-button v-b-tooltip.hover title="Remove from browser" class="btn btn-sm bg-transparent" v-on:click="clickedDeleteTrail(trail.uuid)"><font-awesome-icon icon="trash" :class="plotted_classes(trail.uuid)" /></b-button>
									</div>
								</div>
							</div>
							<div class="namecontent_details">
								<span v-if="show_details" class="trail_details">file: {{ trail.filename_printed }}</span>
								<span v-if="show_details" class="trail_details">creator: {{ trail.creator }}</span>
								<span v-if="show_details" class="trail_details">link: <a :href="trail.metadata_link">{{ trail.metadata_linktext }}</a></span>
								<span v-if="!trail.matches_file && !trail.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> please save this segment and re-import it - <a href="" v-on:click="acknowledgeInfo(trail.uuid)">Dismiss</a></span>
							</div>
						</td>
						<td class="photorow_actions" :set="[shown_photorow_count=indexed_photos[trail.uuid].filter(photo => !excluded_cameras.includes(photo.camera_model)).length, total_photorow_count=indexed_photos[trail.uuid].length]">
							<b-button v-if="!trail.show_photos" class="show_photos btn btn-sm bg-transparent" v-b-tooltip.hover title="Show photos" v-on:click="toggleShowPhotos(trail.uuid)">
								<font-awesome-icon icon="camera"></font-awesome-icon>
								<div v-if="shown_photorow_count === total_photorow_count">({{ shown_photorow_count }})</div>
								<div v-if="shown_photorow_count !== total_photorow_count">({{ shown_photorow_count }} of {{ total_photorow_count }})</div>
							</b-button>
							<b-button v-if="trail.show_photos" class="show_photos btn btn-sm bg-transparent" v-b-tooltip.hover title="Show data" v-on:click="toggleShowPhotos(trail.uuid)">
								<font-awesome-icon icon="table"></font-awesome-icon>
								<div v-if="shown_photorow_count === total_photorow_count">({{ shown_photorow_count }})</div>
								<div v-if="shown_photorow_count !== total_photorow_count">({{ shown_photorow_count }} of {{ total_photorow_count }})</div>
							</b-button>
						</td>
						<td v-if="trail.show_photos" class="variable_content_columns">
							<RowOfPhotos :row_photos="indexed_photos[trail.uuid]" :excluded_cameras="excluded_cameras" :time_format="time_format" :epoch_to_datestring="epoch_to_datestring" :epoch_to_timestring="epoch_to_timestring" :show_date="false" :show_details="show_details" :show_image_specs="show_image_specs" :toggleCameraInclusion="toggleCameraInclusion" :clickedDeletePhoto="clickedDeletePhoto" />
						</td>
						<td v-if="!trail.show_photos" class="variable_content_columns">
							<RowOfNumbers :trail="trail" :units="units" :epoch_to_timestring="epoch_to_timestring" :epoch_to_datestring="epoch_to_datestring" />
						</td>
					</tr>
				</tbody>
			</table>
			<div v-if="!trails.length" class="no_trails"><span class="info_message"><font-awesome-icon icon="info-circle" />Please import a GPS data file above.</span></div>
		</div>

		<div v-if="!photo_count" class="no_photos"><span class="info_message"><font-awesome-icon icon="info-circle" />Please import an image file above.</span></div>
		<div v-if="photo_count" class="container table-responsive-sm p-0">
			<table class="table table-sm">
				<thead>
					<tr :set="[shown_unindexed_photo_count=unindexed_photos.filter(photo => !excluded_cameras.includes(photo.camera_model)).length, total_unindexed_photo_count=unindexed_photos.length]">
						<th v-if="shown_unindexed_photo_count === total_unindexed_photo_count"><span v-if="trails.length">Unassigned </span>Photos ({{ shown_unindexed_photo_count }})</th>
						<th v-if="shown_unindexed_photo_count !== total_unindexed_photo_count"><span v-if="trails.length">Unassigned </span>Photos ({{ shown_unindexed_photo_count }} of {{ total_unindexed_photo_count }} shown)</th>
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
	props: ['add_trails', 'add_images', 'trails', 'photos', 'indexed_photos', 'unindexed_photos_uuids', 'unindexed_photos', 'photo_count', 'excluded_cameras', 'units', 'time_format', 'epoch_to_timestring', 'epoch_to_datestring', 'plotted_classes', 'acknowledgeInfo', 'submitTrailEdits', 'submitTrailDatetimeEdits', 'clickedPlotTrail', 'clickedSaveTrail', 'clickedDeleteTrail', 'clickedDeletePhoto', 'toggleShowPhotos', 'toggleCameraInclusion'],
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
			editing_trail_datetime: null,
			editing_uuid: null,
			new_datetime_edits: '',
			new_name_edits: '',
			hoveringon_datetime_uuid: null,
			hoveringon_uuid: null
		};
	},
	computed: {
		sortedTrails: function() {
			let cloned = [...this.trails];
			let showing = [];
			if (this.show_only_plotted) {
				showing = cloned.filter(trail => trail.is_plotted === true);
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
		},
		shown_photo_count: function() {
			return this.photos
				.filter(p => !this.excluded_cameras.includes(p.camera_model))
				.filter(p => !this.unindexed_photos_uuids.includes(p.uuid))
				.length;
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
		clickedEditTrail: function(trail_uuid) {
			let trail_index = this.trails.findIndex(trail => trail.uuid === trail_uuid);
			if (this.editing_uuid !== trail_uuid) {
				this.editing_uuid = trail_uuid;
				this.new_name_edits = this.trails[trail_index].name;
			} else {
				this.editing_uuid = null;
				this.new_name_edits = '';
			}
		},
		clickedSubmitEdits: function(e) {
			this.editing_uuid = null;
			this.new_name_edits = '';
			this.submitTrailEdits(e);
		},
		clickedEditTrailDatetime: function(trail_uuid) {
			let trail_index = this.trails.findIndex(trail => trail.uuid === trail_uuid);
			if (this.editing_trail_datetime !== trail_uuid) {
				this.editing_trail_datetime = trail_uuid;
				this.new_datetime_edits = this.trails[trail_index].start_time;
			} else {
				this.editing_trail_datetime = null;
				this.new_datetime_edits = '';
			}
		},
		clickedSubmitDatetimeEdits: function(e) {
			this.editing_trail_datetime = null;
			this.new_datetime_edits = '';
			this.submitTrailDatetimeEdits(e);
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
		display: flex;
		justify-content: center;
		margin: 0;
		padding: 0;
	}
	.photorow_actions button {
		width: 50px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.show_photos {
		min-width: 75px;
		margin: 2px;
		padding: 8px;
		border: 0;
		color: black;
		border: 1px solid transparent;
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
	table {
		table-layout: fixed;
	}
	th.datecol {
		width: 15%;
	}
	th.namecol {
		width: 30%;
	}
	th.actioncol {
		width: 80px;
		max-width: 80px;
	}
	.variable_content_columns {
		width: 500px;
	}
	table > thead > tr > th {
		vertical-align: middle;
	}
	tr > td {
		vertical-align: middle;
	}
	th > span.linebreak {
		display: block;
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
	.trail_datetime,
	.trail_name {
		font-weight: 800;
	}
	.trail_datetime.editing,
	.trail_name.editing {
		border: 5px solid red;
		padding: 2px 2px;
		width: 100%;
	}
	.trail_details {
		padding: 4px 4px;
		display: block;
	}
	.sortable {
		cursor: pointer;
	}
	.table_header_section {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
	.table_header_section > * {
		flex: 1 1 33%;
	}
	.table_header_section > .import_buttons {
		flex: 0 0 175px;
	}
	.import_buttons {
		padding: 5px 0;
		width: 33%;
	}
	.import_buttons form,
	.import_buttons form .btn {
		margin: 0;
		padding: 0;
	}
	.import_buttons input {
		visibility: hidden;
		height: 0;
		width: 0;
	}
	.import_buttons label {
		width: 175px;
		border: 1px solid silver;
	}
	.import_buttons label:hover {
		cursor: pointer;
		background: #eee;
	}
	.view_checkbox_buttons {
		display:flex;
		justify-content: flex-end;
	}
	input.chk_btn {
		display: none;
	}
	input.chk_btn + label {
		border: 1px solid grey;
		background: white;
		padding: 5px 8px;
		cursor: pointer;
		border-radius: 5px;
	}
	input.chk_btn:not(:checked) + label:hover {
		box-shadow: 0px 1px 3px;
	}
	input.chk_btn + label:active,
	input.chk_btn:checked + label {
		box-shadow: 0px 0px 3px inset;
		background: #eee;
	}
	.no_trails,
	.no_photos {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 5em;
		background-color: #fadadd;
		border: 5px dashed palevioletred;
		border-radius: 5px;
	}
</style>