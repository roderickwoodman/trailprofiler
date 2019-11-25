<template>
  <div id="app">

    <h1>Trail Chart</h1>
    <TrailDataChart :units="units" :sequences="sequences" :plot_order="plot_order" />

    <form id="file-input-form" class="mx-auto pt-3" style="width: 300px">
        <label for="my-file" class="btn btn-primary" style="width: 100%">Import GPS Data <font-awesome-icon icon="upload" /></label>
        <input @change="onFileChange" id="my-file" style="visibility:hidden; height:0; width:0;" name="files[]" accept=".gpx" multiple type="file" />
    </form>

    <h1>Trail Data</h1>
    <span>Units: 
    <select v-model="units">
        <option value="english" selected>English</option>
        <option value="metric">Metric</option>
    </select>
    </span>

    <TrailDataGrid :units="units" :sequences="sequences" :plot_order="plot_order" :plotted_labels="plotted_labels" :acknowledgeInfo="acknowledgeInfo" :clickedPlotSequence="clickedPlotSequence" :clickedSaveSequence="clickedSaveSequence" :clickedDeleteSequence="clickedDeleteSequence" />

  </div>
</template>
<script>
import TrailDataChart from './components/TrailDataChart.vue';
import TrailDataGrid from './components/TrailDataGrid.vue';

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
		onFileChange: function(evt) {
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
		arrayAverage: function(arr) {
			let sum = arr.reduce( (sum, curr) => sum + curr );
			return sum / arr.length;
		},
		addSequence: function(filename, gpx_xml) {

			let parser, xml_doc;
			let start_new_segment = true, last_datapoint = false;

			parser = new DOMParser();
			xml_doc = parser.parseFromString(gpx_xml, 'text/xml');

			let points = xml_doc.getElementsByTagName('trkpt');
			let prev_lat, prev_lon, prev_time, min_ele, max_ele;
			let new_distance_delta, arr_distance_deltas, arr_distance_aggrs, new_time_delta, arr_time_deltas, arr_time_aggrs;

			let segment_start_index = 0, segment_num = 0;
			let sequence_name_from_file = xml_doc.getElementsByTagName('name')[0].innerHTML;
			// eslint-disable-next-line no-console
			console.log('=== ' + sequence_name_from_file + ' has ' + points.length + ' points ===');
			for (let sequence of this.sequences) {
				if (sequence.name.includes(sequence_name_from_file)) {
					// eslint-disable-next-line no-console
					console.log('dont add duplicates: ', sequence_name_from_file);
					return; // don't add duplicates
				}
			}
			var new_segment = {};
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
					if (segment_start_index === 0) {
						new_segment['filename'] = filename;
					} else {
						new_segment['filename'] = 'N/A (this is only part of an imported file)';
					}
					new_segment['uuid'] = this.generate_uuidv4();
					new_segment['points'] = [];
					new_segment['is_plotted'] = false;
					new_segment['acknowledged'] = false;

					new_distance_delta = 0;
					new_time_delta = 0;
					arr_distance_deltas = [0];
					arr_distance_aggrs = [0];
					arr_time_deltas = [0];
					arr_time_aggrs = [0];

					prev_lat = new_point.latitude;
					prev_lon = new_point.longitude;
					prev_time = new_point.time;
					min_ele = parseInt(points[segment_start_index].getElementsByTagName('ele')[0].innerHTML);
					max_ele = min_ele;
				}
				start_new_segment = false;
				if (p === points.length-1) {
					last_datapoint = true;
				}

				new_distance_delta = this.getDeltaDistanceInKilometers(prev_lat, prev_lon, new_point.latitude, new_point.longitude);
				new_time_delta = (new_point.time - prev_time) / 1000;

				// detect outliers

				// A: GAP BETWEEN ADJACENT POINTS IS > 4 HOURS
				if (new_time_delta > 4 * 60* 60) {
					// eslint-disable-next-line no-console
					console.log('  time outlier at ' + arr_distance_aggrs[arr_distance_aggrs.length - 1] + ' ( ' + arr_time_aggrs.length + ' of ' + points.length + '): ', new_time_delta);
					if (arr_time_deltas.length > 4) {
						// eslint-disable-next-line no-console
						console.log('  ==> ' 
						+ arr_time_deltas[arr_time_deltas.length-4] + ' '
						+ arr_time_deltas[arr_time_deltas.length-3] + ' '
						+ arr_time_deltas[arr_time_deltas.length-2] + ' '
						+ arr_time_deltas[arr_time_deltas.length-1] + ' ' + new_time_delta);
					}
					start_new_segment = true;
				// B: GAP BETWEEN ADJACENT POINTS IS > 1 KILOMETER
				} else if (new_distance_delta > 1) {
					// eslint-disable-next-line no-console
					console.log('  distance outlier at ' + arr_distance_aggrs[arr_distance_aggrs.length - 1].toFixed(3) + ' ( ' + arr_distance_aggrs.length + ' of ' + points.length + '): ', new_distance_delta.toFixed(3));
					if (arr_distance_deltas.length > 4) {
						// eslint-disable-next-line no-console
						console.log('  ==> ' 
						+ arr_distance_deltas[arr_distance_deltas.length-4].toFixed(3) + ' '
						+ arr_distance_deltas[arr_distance_deltas.length-3].toFixed(3) + ' '
						+ arr_distance_deltas[arr_distance_deltas.length-2].toFixed(3) + ' '
						+ arr_distance_deltas[arr_distance_deltas.length-1].toFixed(3) + ' ' + new_distance_delta);
					}
					start_new_segment = true;
				// C: SPEED IS > 5 KM/S (11 MPH)
				} else if (new_distance_delta / new_time_delta > 0.005) {
					if (p % 100 === 0) {
						// eslint-disable-next-line no-console
						console.log('  speed outlier at ' + arr_distance_aggrs[arr_distance_aggrs.length - 1].toFixed(3) + ' ( ' + arr_distance_aggrs.length + ' of ' + points.length + '): ', (new_distance_delta/new_time_delta).toFixed(5));
					}
					start_new_segment = true;
				}

				// the current datapoint is not an outlier, so include it
				if (!start_new_segment) {

					arr_distance_deltas.push(new_distance_delta);
					arr_distance_aggrs.push(arr_distance_aggrs[arr_distance_aggrs.length - 1] + new_distance_delta);

					arr_time_deltas.push(new_time_delta);
					arr_time_aggrs.push(arr_time_aggrs[arr_time_aggrs.length - 1] + new_time_delta);

					max_ele = (new_point.elevation > max_ele) ? new_point.elevation : max_ele;
					min_ele = (new_point.elevation < min_ele) ? new_point.elevation : min_ele;

					prev_lat = new_point.latitude;
					prev_lon = new_point.longitude;
					prev_time = new_point.time;

					new_segment.points.push(new_point);
				}

				// the current datapoint is the last in the segment, so finalize the data in this segment
				if ((start_new_segment || last_datapoint) && new_segment.points.length) {

					segment_num += 1;
					if (!last_datapoint) {
						p -= 1;
						segment_start_index = p;
					}
					if (last_datapoint && segment_start_index === 0) {
						new_segment['has_outliers'] = false;
						new_segment['matches_file'] = true;
						new_segment['filename'] = filename;
					} else {
						new_segment['matches_file'] = false;
						new_segment['filename'] = 'N/A (this is only part of an imported file)';
						new_segment['new_filename'] = filename.slice(0,-4) + '_part' + segment_num + '.gpx';
						new_segment['name'] = 'PART' + segment_num + ' ' + new_segment.name;
					}

					new_segment['arr_distance_deltas'] = arr_distance_deltas;
					new_segment['arr_distance_aggrs'] = arr_distance_aggrs;
					new_segment['arr_time_deltas'] = arr_time_deltas;
					new_segment['arr_time_aggrs'] = arr_time_aggrs;
					new_segment['total_distance'] = new_segment.arr_distance_aggrs[arr_distance_aggrs.length - 1];
					new_segment['total_time'] = new_segment.arr_time_aggrs[arr_time_aggrs.length - 1];
					new_segment['average_pace'] = 60 * 60 * new_segment.total_distance / new_segment.total_time;
					new_segment['start_time'] = new_segment.points[0].time;
					new_segment['maximum_elevation'] = max_ele;
					new_segment['minimum_elevation'] = min_ele;

					if (new_segment.points.length >= 50) {
						// eslint-disable-next-line no-console
						console.log('  saved ' + new_segment.points.length + ' points for sequence: ' + new_segment.name);
						this.sequences.push(new_segment);
					} else {
						segment_num -= 1;
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

			// eslint-disable-next-line no-console
			console.log('TBI: save sequence ' + sequence_uuid + ' as filename "' + filename + '"');

			let text='file content';

			var pom = document.createElement('a');
			pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
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
