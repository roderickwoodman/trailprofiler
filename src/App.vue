<template>
	<div id="app">

		<div class="page_header_section">
			<div class="page_title">
				<h1>Trail Chart</h1>
			</div>
			<div class="page_settings_buttons">
				<div>
					<b-button id="popover-3" variant="primary"><font-awesome-icon icon="cog"></font-awesome-icon></b-button>
					<b-popover target="popover-3" triggers="hover focus" placement="bottomleft">
						<template v-slot:title class="text-middle">Page Settings</template>
						<div class="text-right m-2">
							<span>Units: 
							<select v-model="units">
								<option value="english" selected>English</option>
								<option value="metric">Metric</option>
							</select>
							</span>
						</div>
						<div class="text-right m-2">
							<span>Time Format: 
							<select v-model="time_format">
								<option value="ampm" selected>AM/PM</option>
								<option value="24hr">24-hr</option>
								<option value="epoch">epoch</option>
							</select>
							</span>
						</div>
					</b-popover>
				</div>
			</div>
		</div>
		<TrailDataChart :units="units" :trails="trails" :plot_order="plot_order" />
		<TrailDataGrid :add_trails="onGpxFileChange" :add_images="onImageFileChange" :trails="trails" :photos="photos" :indexed_photos="indexed_photos" :unindexed_photos_uuids="unindexed_photos_uuids" :unindexed_photos="unindexed_photos" :photo_count="photos.length" :excluded_cameras="excluded_cameras" :units="units" :time_format="time_format" :epoch_to_timestring="epoch_to_timestring" :epoch_to_datestring="epoch_to_datestring" :acknowledgeInfo="acknowledgeTrailInfo" :plotted_classes="plotted_classes" :submitTrailEdits="submitTrailEdits" :submitTrailDatetimeEdits="submitTrailDatetimeEdits" :clickedPlotTrail="clickedPlotTrail" :clickedSaveTrail="clickedSaveTrail" :clickedDeleteTrail="clickedDeleteTrail" :clickedDeletePhoto="clickedDeletePhoto" :toggleShowPhotos="toggleShowPhotos" :toggleCameraInclusion="toggleCameraInclusion" />

	</div>
</template>


<script>
import TrailDataChart from './components/TrailDataChart.vue';
import TrailDataGrid from './components/TrailDataGrid.vue';

import EXIF from 'exif-js';

export default {
	name: 'app',
	components: {
		TrailDataChart,
		TrailDataGrid
	},
	data() {
		return {
			photos: [],
			excluded_cameras: [],
			trails: [],
			plot_order: [],
			units: 'english',
			time_format: 'ampm',
			plotted_labels: [
				'plotted-label-a',
				'plotted-label-b',
				'plotted-label-c',
				'plotted-label-d',
				'plotted-label-e',
				'plotted-label-f',
				'plotted-label-g',
				'plotted-label-h',
				'plotted-label-i',
				'plotted-label-j',
				'plotted-label-k',
				'plotted-label-l',
				'plotted-label-m',
				'plotted-label-n',
				'plotted-label-o',
				'plotted-label-p'
			]
		};
	},
	computed: {
		exif_photos_uuids: function() {
			return this.photos.filter( photo => photo.has_exif_data ).map(obj => obj.uuid);
		},
		indexed_photos: function() { // index photos by the trail that they fall within, time-wise
			let indexed = {};
			for (let trail of this.trails) {
				indexed[trail.uuid] = this.photos
					.filter(photo => (trail.start_time <= photo.datetime && photo.datetime <= trail.end_time));
			}
			return indexed;
		},
		unindexed_photos_uuids: function() {
			let unindexed = [];
			for (let photo_uuid of this.exif_photos_uuids) {
				let photo_is_indexed = false;
				for (let trail_uuid of Object.keys(this.indexed_photos)) {
					if (this.indexed_photos[trail_uuid].includes(photo_uuid)) {
						photo_is_indexed = true;
						break;
					}
				}
				if (!photo_is_indexed) {
					unindexed.push(photo_uuid);
				}
			}
			return unindexed;
		},
		unindexed_photos: function() {
			return this.unindexed_photos_uuids.map(uuid => this.photos[this.photos.findIndex(p => p.uuid === uuid)]);
		}
	},
	mounted() {
		if (localStorage.trails) {
			this.trails = JSON.parse(localStorage.trails);
		}
		if (localStorage.photos) {
			this.photos = JSON.parse(localStorage.photos);
		}
		if (localStorage.excluded_cameras) {
			this.excluded_cameras = JSON.parse(localStorage.excluded_cameras);
		}
		if (localStorage.units) {
			this.units = JSON.parse(localStorage.units);
		}
		if (localStorage.time_format) {
			this.time_format = JSON.parse(localStorage.time_format);
		}
		if (localStorage.plot_order) {
			this.plot_order = JSON.parse(localStorage.plot_order);
		}
	},
	watch: {
		trails: {
			handler: function (new_trails) {
				localStorage.trails = JSON.stringify(new_trails);
			},
			deep: true
		},
		photos: {
			handler: function (new_photos) {
				localStorage.photos = JSON.stringify(new_photos);
			},
			deep: true
		},
		excluded_cameras: {
			handler: function (new_excluded_cameras) {
				localStorage.excluded_cameras = JSON.stringify(new_excluded_cameras);
			}
		},
		units: {
			handler: function (new_units) {
				localStorage.units = JSON.stringify(new_units);
			}
		},
		time_format: {
			handler: function (new_time_format) {
				localStorage.time_format = JSON.stringify(new_time_format);
			}
		},
		plot_order: {
			handler: function (new_plot_order) {
				localStorage.plot_order = JSON.stringify(new_plot_order);
			}
		}
	},
	methods: {
		generate_uuidv4: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		onGpxFileChange: function(evt) {
			const files = evt.target.files;
			Object.keys(files).forEach(i => {
				const file = files[i];
				const reader = new FileReader();
				reader.onload = (evt) => {
					this.addTrail(file.name, evt.target.result);
				};
				reader.readAsText(file);
			});
		},
		onImageFileChange: function(evt) {
			const files = evt.target.files;
			let self = this;
			Object.keys(files).forEach(i => {
				let new_photo = {};
				new_photo['uuid'] = this.generate_uuidv4();
				const file = files[i];
				for (let photo of this.photos) {
					if (photo.filename === file.name) {
						return; // don't add duplicates
					}
				}
				new_photo['filename'] = file.name;
				new_photo['acknowledged'] = false;
				EXIF.getData(file, function() {
					let exif = EXIF.getAllTags(this);
					new_photo['exif'] = exif;
					if (Object.keys(exif).length === 0) {
						// eslint-disable-next-line no-console
						console.log('file ' + file.name + ' has no exif data');
						new_photo['has_exif_data'] = false;
						new_photo['datetime'] = '?';
						new_photo['camera_make'] = '?';
						new_photo['camera_model'] = '?';
						new_photo['iso'] = '?';
						new_photo['aperture'] = '?';
						new_photo['shutter_printable'] = '?';
						new_photo['shutter'] = '?';
					} else {
						// eslint-disable-next-line no-console
						console.log('exif data: ', exif);
						new_photo['has_exif_data'] = true;
						let params = exif.DateTime.replace(' ',':').split(':');
						params[1] = parseInt(params[1]) - 1;
						let date = new Date(...params);
						new_photo['datetime'] = date.getTime();
						new_photo['camera_make'] = exif.Make;
						new_photo['camera_model'] = exif.Model;
						new_photo['iso'] = Math.round(exif.ISOSpeedRatings);
						new_photo['aperture'] = exif.ApertureValue.numerator / exif.ApertureValue.denominator;
						new_photo['aperture_printable'] = 'F' + Math.round(new_photo.aperture*10)/10;
						new_photo['shutter'] = exif.ExposureTime.numerator / exif.ExposureTime.denominator;
						new_photo['shutter_printable'] = exif.ExposureTime.numerator + '/' + exif.ExposureTime.denominator;
					}
					self.photos.push(new_photo);
				});
			});
		},
		arrayAverage: function(arr) {
			let sum = arr.reduce( (sum, curr) => sum + curr );
			return sum / arr.length;
		},
		addTrail: function(filename, gpx_xml) {

			let parser, xml_doc;
			let start_new_segment = true, last_datapoint = false;

			parser = new DOMParser();
			xml_doc = parser.parseFromString(gpx_xml, 'text/xml');

			let gpx = xml_doc.getElementsByTagName('gpx');
			let creator = gpx[0].getAttribute('creator');
			let metadata = xml_doc.getElementsByTagName('metadata');
			let link = metadata[0].getElementsByTagName('link');
			let metadata_link = link[0].getAttribute('href');
			let metadata_linktext = link[0].getElementsByTagName('text')[0].innerHTML;
			let points = xml_doc.getElementsByTagName('trkpt');
			let wholefile_min_ele = parseInt(points[0].getElementsByTagName('ele')[0].innerHTML);
			let wholefile_max_ele = wholefile_min_ele;
			let wholefile_prev_lat = points[0].getAttribute('lat');
			let wholefile_prev_lon = points[0].getAttribute('lon');
			let wholefile_prev_time = new Date(points[0].getElementsByTagName('time')[0].innerHTML).valueOf();
			let segment_prev_lat, segment_prev_lon, segment_prev_time;
			let segment_min_ele, segment_max_ele;
			let segment_distance_deltas, segment_distance_aggrs, segment_time_deltas, segment_time_aggrs;
			let new_segment_ddelta, new_segment_tdelta, new_wholefile_ddelta, new_wholefile_tdelta;
			let wholefile_distance_deltas = [0], wholefile_distance_aggrs = [0], wholefile_time_deltas = [0], wholefile_time_aggrs = [0];
			let segment_start_index = 0, segment_num = 0;

			for (let trail of this.trails) {
				if (trail.filename === filename) {
					return; // don't add duplicates
				}
			}
			// eslint-disable-next-line no-console
			console.log('=== ' + filename + ' has ' + points.length + ' points ===');

			let wholefile = Object.assign({}, {});
			wholefile['name'] = xml_doc.getElementsByTagName('name')[0].innerHTML;
			wholefile['filename'] = filename;
			wholefile['filename_printed'] = filename;
			wholefile['creator'] = (creator === '' ) ? '(none listed)' : creator;
			wholefile['metadata_link'] = metadata_link;
			wholefile['metadata_linktext'] = metadata_linktext;
			wholefile['uuid'] = this.generate_uuidv4();
			wholefile['points'] = [];
			wholefile['is_plotted'] = false;
			wholefile['acknowledged'] = false;
			wholefile['show_photos'] = false;
			let new_segment = {};
			let doing_point_again = false;
			for (let p=0; p < points.length; p++) {

				let new_point = {};
				let new_time = new Date(points[p].getElementsByTagName('time')[0].innerHTML).valueOf();
				new_point = {
					'time': new_time,
					'latitude': points[p].getAttribute('lat'),
					'longitude': points[p].getAttribute('lon'),
					'elevation': parseInt(points[p].getElementsByTagName('ele')[0].innerHTML)
				};

				// initialize
				if (start_new_segment) {

					new_segment = Object.assign({}, {});
					new_segment['name'] = xml_doc.getElementsByTagName('name')[0].innerHTML;
					new_segment['filename'] = filename;
					if (segment_start_index === 0) {
						new_segment['filename_printed'] = filename;
					} else {
						new_segment['filename_printed'] = 'N/A (this is only part of an imported file)';
					}
					new_segment['creator'] = (creator === '' ) ? 'TrailProfiler' : 'TrailProfiler (via '+creator+')';
					new_segment['metadata_link'] = 'https://trailprofiler.com';
					new_segment['metadata_linktext'] = 'TrailProfiler.com';
					new_segment['uuid'] = this.generate_uuidv4();
					new_segment['points'] = [];
					new_segment['is_plotted'] = false;
					new_segment['acknowledged'] = false;
					new_segment['show_photos'] = false;

					new_segment_ddelta = 0;
					new_segment_tdelta = 0;
					segment_distance_deltas = [0];
					segment_distance_aggrs = [0];
					segment_time_deltas = [0];
					segment_time_aggrs = [0];

					segment_prev_lat = new_point.latitude;
					segment_prev_lon = new_point.longitude;
					segment_prev_time = new_point.time;
					segment_min_ele = parseInt(points[segment_start_index].getElementsByTagName('ele')[0].innerHTML);
					segment_max_ele = segment_min_ele;
				}
				start_new_segment = false;
				if (p === points.length-1) {
					last_datapoint = true;
				}

				new_segment_ddelta = this.getDeltaDistanceInKilometers(segment_prev_lat, segment_prev_lon, new_point.latitude, new_point.longitude);
				new_segment_tdelta = (new_point.time - segment_prev_time) / 1000;

				new_wholefile_ddelta = this.getDeltaDistanceInKilometers(wholefile_prev_lat, wholefile_prev_lon, new_point.latitude, new_point.longitude);
				new_wholefile_tdelta = (new_point.time - wholefile_prev_time) / 1000;

				// detect outliers

				// A: GAP BETWEEN ADJACENT POINTS IS > 4 HOURS
				if (new_segment_tdelta > 4 * 60* 60) {
					start_new_segment = true;
				// B: GAP BETWEEN ADJACENT POINTS IS > 1 KILOMETER
				} else if (new_segment_ddelta > 1) {
					start_new_segment = true;
				// C: SPEED IS > 5 KM/S (11 MPH)
				} else if (new_segment_ddelta / new_segment_tdelta > 0.005) {
					start_new_segment = true;
				}

				// the current datapoint is not an outlier, so include it in the segment trail
				if (!start_new_segment) {

					segment_distance_deltas.push(new_segment_ddelta);
					segment_distance_aggrs.push(segment_distance_aggrs[segment_distance_aggrs.length - 1] + new_segment_ddelta);
					segment_time_deltas.push(new_segment_tdelta);
					segment_time_aggrs.push(segment_time_aggrs[segment_time_aggrs.length - 1] + new_segment_tdelta);
					segment_max_ele = (new_point.elevation > segment_max_ele) ? new_point.elevation : segment_max_ele;
					segment_min_ele = (new_point.elevation < segment_min_ele) ? new_point.elevation : segment_min_ele;

					segment_prev_lat = new_point.latitude;
					segment_prev_lon = new_point.longitude;
					segment_prev_time = new_point.time;

					new_segment.points.push(new_point);
				}

				// record all datapoints in the whole file trail unless the datapoint has already been recorded
				if (!doing_point_again) {

					wholefile_distance_deltas.push(new_wholefile_ddelta);
					wholefile_distance_aggrs.push(wholefile_distance_aggrs[wholefile_distance_aggrs.length - 1] + new_wholefile_ddelta);
					wholefile_time_deltas.push(new_wholefile_tdelta);
					wholefile_time_aggrs.push(wholefile_time_aggrs[wholefile_time_aggrs.length - 1] + new_wholefile_tdelta);
					wholefile_max_ele = (new_point.elevation > wholefile_max_ele) ? new_point.elevation : wholefile_max_ele;
					wholefile_min_ele = (new_point.elevation < wholefile_min_ele) ? new_point.elevation : wholefile_min_ele;

					wholefile_prev_lat = new_point.latitude;
					wholefile_prev_lon = new_point.longitude;
					wholefile_prev_time = new_point.time;

					wholefile.points.push(Object.assign({}, new_point));
				}
				doing_point_again = false;

				// the current datapoint is the last in the segment, so finalize the data in this segment
				if ((start_new_segment || last_datapoint) && new_segment.points.length) {

					if (new_segment.points.length < 50) {
						continue;
					}

					let segment_end_index = (last_datapoint) ? p : p - 1;
					segment_num += 1;

					// the current segment is only part of the file being imported
					if (!last_datapoint || segment_start_index !== 0) {
						new_segment['matches_file'] = false;
						new_segment['filename_printed'] = 'N/A (this is only part of an imported file)';
						new_segment['new_filename'] = filename.slice(0,-4) + '_part' + segment_num + '.gpx';
						new_segment['name'] = 'PART' + segment_num + ' ' + new_segment.name;
						new_segment['file_content'] = gpx_xml;
						let segment_xml_doc = parser.parseFromString(gpx_xml, 'text/xml');
						let trkpts = [...segment_xml_doc.getElementsByTagName('trkpt')];
						trkpts.forEach(function(trkpt,idx) {if (idx < segment_start_index || idx > segment_end_index) {trkpt.remove();}});
						let serializer = new XMLSerializer();
						let serialized_xml = serializer.serializeToString(segment_xml_doc);
						new_segment['file_content'] = serialized_xml;
						new_segment['arr_distance_deltas'] = segment_distance_deltas;
						new_segment['arr_distance_aggrs'] = segment_distance_aggrs;
						new_segment['arr_time_deltas'] = segment_time_deltas;
						new_segment['arr_time_aggrs'] = segment_time_aggrs;
						new_segment['total_distance'] = segment_distance_aggrs[segment_distance_aggrs.length - 1];
						new_segment['total_time'] = segment_time_aggrs[segment_time_aggrs.length - 1];
						new_segment['average_pace'] = new_segment.total_time / new_segment.total_distance; // seconds per km
						new_segment['start_time'] = new_segment.points[0].time;
						new_segment['end_time'] = new_segment.points[new_segment.points.length - 1].time;
						new_segment['maximum_elevation'] = segment_max_ele;
						new_segment['minimum_elevation'] = segment_min_ele;
						// eslint-disable-next-line no-console
						console.log('  saved ' + new_segment.points.length + ' points for trail: ' + new_segment.name);
						this.trails.push(new_segment);
					}

					// the current segment is the last segment
					if (last_datapoint) {
						wholefile['matches_file'] = true;
						wholefile['filename_printed'] = filename;
						wholefile['new_filename'] = filename;
						wholefile['file_content'] = gpx_xml;
						wholefile['arr_distance_deltas'] = wholefile_distance_deltas;
						wholefile['arr_distance_aggrs'] = wholefile_distance_aggrs;
						wholefile['arr_time_deltas'] = wholefile_time_deltas;
						wholefile['arr_time_aggrs'] = wholefile_time_aggrs;
						wholefile['total_distance'] = wholefile_distance_aggrs[wholefile_distance_aggrs.length - 1];
						wholefile['total_time'] = wholefile_time_aggrs[wholefile_time_aggrs.length - 1];
						wholefile['average_pace'] = wholefile.total_time / wholefile.total_distance; // seconds per km
						wholefile['start_time'] = wholefile.points[0].time;
						wholefile['end_time'] = wholefile.points[new_segment.points.length - 1].time;
						wholefile['maximum_elevation'] = wholefile_max_ele;
						wholefile['minimum_elevation'] = wholefile_min_ele;
						// eslint-disable-next-line no-console
						console.log('  saved ' + wholefile.points.length + ' points for trail: ' + wholefile.name);
						this.trails.push(wholefile);
					}

					if (!last_datapoint) {
						doing_point_again = true; // re-loop on this point, since it may not be an outlier in the next segment
						p -= 1;
						segment_start_index = p;
					}
				}
			}
		},
		getDeltaDistanceInKilometers: function(lat1, lon1, lat2, lon2) {
			var R = 6371; // Radius of the earth in kilometers
			var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
			var dLon = this.deg2rad(lon2-lon1); 
			var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in kilometers
			return d;
		},
		deg2rad: function(deg) {
			return deg * (Math.PI/180);
		},
		submitTrailEdits: function (e) {
			let trail_uuid = e.target['trail_uuid'].value;
			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			this.trails[trail_num].name = e.target['new_name_edits'].value;
			this.trails[trail_num].matches_file = false;
			this.trails[trail_num].acknowledged = false;
			e.preventDefault();
		},
		submitTrailDatetimeEdits: function (e) {
			let trail_uuid = e.target['trail_uuid'].value;
			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			let delta = e.target['new_datetime_edits'].value - this.trails[trail_num].start_time;
			this.trails[trail_num].start_time += delta;
			this.trails[trail_num].end_time += delta;
			for (let p of this.trails[trail_num].points) {
				p.time += delta;
			}
			this.trails[trail_num].matches_file = false;
			this.trails[trail_num].acknowledged = false;
			e.preventDefault();
		},
		clickedPlotTrail: function (trail_uuid) {
			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			this.trails[trail_num].is_plotted = !this.trails[trail_num].is_plotted;
			let plot_order_num = this.plot_order.indexOf(trail_uuid);
			if (plot_order_num === -1) {
				this.plot_order.push(trail_uuid);
			} else {
				this.plot_order.splice(plot_order_num, 1);
			}
		},
		clickedSaveTrail: function (trail_uuid) {

			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			let filename = this.trails[trail_num].new_filename;
			let content_to_write=this.trails[trail_num].file_content;
			content_to_write = content_to_write.replace(/<name>[\s\S]*?<\/name>/, '<name>' + this.trails[trail_num].name + '</name>');
			content_to_write = content_to_write.replace(/creator="[\s\S]*?"/, 'creator="' + this.trails[trail_num].creator + '"');
			content_to_write = content_to_write.replace(/<link href="[\s\S]*?">/, '<link href="' + this.trails[trail_num].metadata_link + '">');
			content_to_write = content_to_write.replace(/<text>[\s\S]*?<\/text>/, '<text>' + this.trails[trail_num].metadata_linktext + '</text>');

			var pom = document.createElement('a');
			pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content_to_write));
			pom.setAttribute('download', filename);

			if (document.createEvent) {
				var event = document.createEvent('MouseEvents');
				event.initEvent('click', true, true);
				pom.dispatchEvent(event);
			}
			else {
				pom.click();
			}
		},
		clickedDeleteTrail: function (trail_uuid) {
			this.trails = this.trails.filter(function (obj) {
				return obj.uuid !== trail_uuid;
			});
			this.plot_order = this.plot_order.filter(function (uuid) {
				return uuid !== trail_uuid;
			});
		},
		clickedDeletePhoto: function (photo_uuid) {
			this.photos = this.photos.filter(function (obj) {
				return obj.uuid !== photo_uuid;
			});
		},
		toggleShowPhotos: function(trail_uuid) {
			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			this.trails[trail_num].show_photos = !this.trails[trail_num].show_photos;
		},
		toggleCameraInclusion: function(camera) {
			let camera_index = this.excluded_cameras.indexOf(camera);
			if (camera_index === -1) {
				this.excluded_cameras.push(camera);
			} else {
				this.excluded_cameras.splice(camera_index, 1);
			}
		},
		acknowledgeTrailInfo: function (trail_uuid) {
			let trail_num = this.trails.findIndex(s => s.uuid === trail_uuid);
			this.trails[trail_num].acknowledged = true;
		},
		acknowledgePhotoInfo: function (photo_uuid) {
			let photo_num = this.photos.findIndex(p => p.uuid === photo_uuid);
			this.photos[photo_num].acknowledged = true;
		},
		epoch_to_timestring: function (epoch) {
			if (!Number.isInteger(epoch)) return '?';
			if (this.time_format === 'epoch') return '?';
			const leadingZero = (num) => (0 + num.toString()).slice(-2);
			let date = new Date(epoch);
			let hours = (this.time_format === 'ampm') ? (date.getHours() + 11) % 12 + 1 : date.getHours();
			let minutes = date.getMinutes();
			let suffix = (this.time_format !== 'ampm') ? '' : (date.getHours() < 12) ? 'AM' : 'PM';
			return leadingZero(hours) + ':' + leadingZero(minutes) + ' ' + suffix;
		},
		epoch_to_datestring: function (epoch) {
			if (!Number.isInteger(epoch)) return '?';
			if (this.time_format === 'epoch') return '?';
			let converted = new Date(epoch);
			return converted.toDateString();
		},
		exifdatetime_to_epoch: function (exif_datetime) { // expect "yyyy:mm:dd hh:mm:ss"
			if (typeof exif_datetime !== 'string') return '?';
			let params = exif_datetime.replace(' ',':').split(':');
			params[1] = parseInt(params[1]) - 1;
			let date = new Date(...params);
			return date.getTime();
		},
		plotted_classes: function (trail_uuid) {
			let plot_order_index = this.plot_order.findIndex(uuid => uuid === trail_uuid);
			if (plot_order_index !== -1) {
				return this.plotted_labels[plot_order_index];
			} else {
				return 'not_plotted';
			}
		}
	}
};
</script>

<style>
	tr.hasInfo {
		background-color: #ddd3ee; /* light grayish violet */
	}
	tr.hasInfo:hover {
		background-color: #b5a0da; /* darker, soft violet */
	}
	tr.hasInfo.acknowledged {
		background-color: white;
	}
	tr:hover,
	tr.acknowledged:hover {
		background-color: #dee2e6; /* light gray */
	}
	.trail_name,
	.info_message {
		padding: 7px 7px;
		display: block;
	}
	.trail_details,
	.info_message {
		font-size: 0.75em;
		line-height: 0.75em;
	}
	.info_message {
		font-style: italic;
	}
	.hoverablecell_actions {
		position: absolute;
		right: 5px;
		top: 5px;
		width: 25%;
		display: flex;
		justify-content: flex-end;
	}
	.hoverablecell_title {
		width: 75%;
	}
	.hoverable_cell {
		position: relative;
	}
	.hoverable_cell .btn.btn-sm {
		border: 0;
		margin: 0;
		padding: 3px;
	}
	.page_header_section {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
	.page_header_section > * {
		display: inline-block;
		flex: 1 1 50%;
	}
	.page_settings_buttons {
		display:flex;
		justify-content: flex-end;
	}
	.page_settings_buttons button {
		color: black;
		border: 1px solid grey;
		background: white;
		padding: 5px 8px;
		cursor: pointer;
		border-radius: 5px;
	}
	.page_settings_buttons button:hover {
		color: black;
		background: white;
		box-shadow: 0px 1px 3px;
	}
</style>
