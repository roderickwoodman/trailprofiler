<template>
  <div id="app">

    <h1>Trail Chart</h1>
    <TrailDataChart :units="units" :sequences="sequences" :plot_order="plot_order" />

    <form id="gpx-file-input-form" class="mx-auto pt-3" style="width: 300px">
        <label for="my-gpx-files" class="btn btn-primary" style="width: 100%">Import GPS Data <font-awesome-icon icon="upload" /></label>
        <input @change="onGpxFileChange" id="my-gpx-files" style="visibility:hidden; height:0; width:0;" name="files[]" accept=".gpx" multiple type="file" />
    </form>
    <form id="image-file-input-form" class="mx-auto pt-3" style="width: 300px">
        <label for="my-image-files" class="btn btn-primary" style="width: 100%">Import Images <font-awesome-icon icon="upload" /></label>
        <input @change="onImageFileChange" id="my-image-files" style="visibility:hidden; height:0; width:0;" name="files[]" accept=".jpg" type="file" />
    </form>

    <h1>Trail Data</h1>
    <span>Units: 
    <select v-model="units">
        <option value="english" selected>English</option>
        <option value="metric">Metric</option>
    </select>
    </span>

    <TrailDataGrid :units="units" :sequences="sequences" :plot_order="plot_order" :plotted_labels="plotted_labels" :acknowledgeInfo="acknowledgeInfo" :submitSequenceEdits="submitSequenceEdits" :clickedPlotSequence="clickedPlotSequence" :clickedSaveSequence="clickedSaveSequence" :clickedDeleteSequence="clickedDeleteSequence" />

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
			sequences: [],
			plot_order: [],
			units: 'english',
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
	mounted() {
		if (localStorage.sequences) {
			this.sequences = JSON.parse(localStorage.sequences);
		}
		if (localStorage.units) {
			this.units = JSON.parse(localStorage.units);
		}
		if (localStorage.plot_order) {
			this.plot_order = JSON.parse(localStorage.plot_order);
		}
	},
	watch: {
		sequences: {
			handler: function (new_sequences) {
				localStorage.sequences = JSON.stringify(new_sequences);
			},
			deep: true
		},
		units: {
			handler: function (new_units) {
				localStorage.units = JSON.stringify(new_units);
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
					this.addSequence(file.name, evt.target.result);
				};
				reader.readAsText(file);
			});
		},
		onImageFileChange: function(evt) {
			const files = evt.target.files;
			Object.keys(files).forEach(i => {
				const file = files[i];
				EXIF.getData(file, function() {
					let all_tags = EXIF.getAllTags(this);
					// eslint-disable-next-line no-console
					console.log('exif data: ', all_tags);
				});
			});
		},
		arrayAverage: function(arr) {
			let sum = arr.reduce( (sum, curr) => sum + curr );
			return sum / arr.length;
		},
		addSequence: function(filename, gpx_xml) {

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

			// eslint-disable-next-line no-console
			console.log('=== ' + filename + ' has ' + points.length + ' points ===');
			for (let sequence of this.sequences) {
				if (sequence.filename === filename) {
					return; // don't add duplicates
				}
			}

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

				// the current datapoint is not an outlier, so include it in the segment sequence
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

				// record all datapoints in the whole file sequence unless the datapoint has already been recorded
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
						new_segment['maximum_elevation'] = segment_max_ele;
						new_segment['minimum_elevation'] = segment_min_ele;
						// eslint-disable-next-line no-console
						console.log('  saved ' + new_segment.points.length + ' points for sequence: ' + new_segment.name);
						this.sequences.push(new_segment);
					}

					// the current segment is the last segment
					if (last_datapoint) {
						wholefile['has_outliers'] = false;
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
						wholefile['maximum_elevation'] = wholefile_max_ele;
						wholefile['minimum_elevation'] = wholefile_min_ele;
						// eslint-disable-next-line no-console
						console.log('  saved ' + wholefile.points.length + ' points for sequence: ' + wholefile.name);
						this.sequences.push(wholefile);
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
		submitSequenceEdits: function (e) {
			let sequence_uuid = e.target['sequence_uuid'].value;
			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			this.sequences[sequence_num].name = e.target['new_name_edits'].value;
			this.sequences[sequence_num].matches_file = false;
			this.sequences[sequence_num].acknowledged = false;
			e.preventDefault();
		},
		clickedPlotSequence: function (sequence_uuid) {
			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			this.sequences[sequence_num].is_plotted = !this.sequences[sequence_num].is_plotted;
			let plot_order_num = this.plot_order.indexOf(sequence_uuid);
			if (plot_order_num === -1) {
				this.plot_order.push(sequence_uuid);
			} else {
				this.plot_order.splice(plot_order_num, 1);
			}
		},
		clickedSaveSequence: function (sequence_uuid) {

			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			let filename = this.sequences[sequence_num].new_filename;
			let content_to_write=this.sequences[sequence_num].file_content;
			content_to_write = content_to_write.replace(/<name>[\s\S]*?<\/name>/, '<name>' + this.sequences[sequence_num].name + '</name>');
			content_to_write = content_to_write.replace(/creator="[\s\S]*?"/, 'creator="' + this.sequences[sequence_num].creator + '"');
			content_to_write = content_to_write.replace(/<link href="[\s\S]*?">/, '<link href="' + this.sequences[sequence_num].metadata_link + '">');
			content_to_write = content_to_write.replace(/<text>[\s\S]*?<\/text>/, '<text>' + this.sequences[sequence_num].metadata_linktext + '</text>');

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
		clickedDeleteSequence: function (sequence_uuid) {
			this.sequences = this.sequences.filter(function (obj) {
				return obj.uuid !== sequence_uuid;
			});
			this.plot_order = this.plot_order.filter(function (uuid) {
				return uuid !== sequence_uuid;
			});
		},
		acknowledgeInfo: function (sequence_uuid) {
			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			this.sequences[sequence_num].acknowledged = true;
		}
	}
};
</script>

<style scoped>
</style>
