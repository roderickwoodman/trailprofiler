<template>
  <div id="app">

    <h1>Trail Chart</h1>
    <TrailDataChart :sequences="sequences" />

    <form id="file-input-form" class="mx-auto pt-3" style="width: 300px">
        <label for="my-file" class="btn btn-primary" style="width: 100%">Add GPX file(s)</label>
        <input @change="onFileChange" id="my-file" style="visibility:hidden; height:0; width:0;" name="files[]" accept=".gpx" multiple type="file" />
    </form>

    <h1>Trail Data</h1>
    <span>Units: 
    <select v-model="units">
        <option value="english" selected>English</option>
        <option value="metric">Metric</option>
    </select>
    </span>

    <TrailDataGrid :units="units" :sequences="sequences" :clickedDeleteSequence="clickedDeleteSequence" :clickedPlotSequence="clickedPlotSequence" :acknowledgeInfo="acknowledgeInfo" />

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
			units: 'english',
			chart_data: {}, //default_data,
			chart_options: {} //default_options
		};
	},
	mounted() {
		if (localStorage.sequences) {
			this.sequences = JSON.parse(localStorage.sequences);
			// for ([index,sequence] of this.sequences.entries()) {
			//     if (sequence.is_plotted) {
			//         // eslint-disable-next-line no-console
			//         console.log("plotting: ", index);
			//         // this.clickedPlotSequence(index);
			//     }
			// }
		}
		if (localStorage.units) {
			this.units = JSON.parse(localStorage.units);
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

		addSequence: function(filename, gpx_xml) {

			let parser, xml_doc;
			let new_sequence = {};

			parser = new DOMParser();
			xml_doc = parser.parseFromString(gpx_xml, 'text/xml');

			let uuid = this.generate_uuidv4();
			new_sequence['uuid'] = uuid;
			new_sequence['filename'] = filename;
			new_sequence['name'] = xml_doc.getElementsByTagName('name')[0].innerHTML;
			for (let sequence of this.sequences) {
				if (sequence.name.replace('ORIG ', '').replace('PART1 ', '').replace('PART2 ', '') === new_sequence.name) {
					return; // don't add duplicates
				}
			}
			new_sequence['points'] = [];
			let points = xml_doc.getElementsByTagName('trkpt');
			let prev_lat, prev_lon, prev_time;
			let min_ele, max_ele = 0;
			let arr_distance_deltas = [];
			let arr_distance_aggrs = [];
			let arr_time_deltas = [];
			let arr_time_aggrs = [];
			for (let p of points) {
				let new_time = new Date(p.getElementsByTagName('time')[0].innerHTML).valueOf();
				let new_point = {
					'time': new_time,
					'latitude': p.getAttribute('lat'),
					'longitude': p.getAttribute('lon'),
					'elevation': parseInt(p.getElementsByTagName('ele')[0].innerHTML)
				};
				let new_distance_delta = 0, new_time_delta = 0;
				if (new_sequence.points.length > 0) {
					new_distance_delta = this.getDeltaDistanceInKilometers(prev_lat, prev_lon, new_point.latitude, new_point.longitude);
					arr_distance_deltas.push(new_distance_delta);
					arr_distance_aggrs.push(arr_distance_aggrs[arr_distance_aggrs.length - 1] + new_distance_delta);
					new_time_delta = (new_point.time - prev_time) / 1000;
					arr_time_deltas.push(new_time_delta);
					arr_time_aggrs.push(arr_time_aggrs[arr_time_aggrs.length - 1] + new_time_delta);
					max_ele = (new_point.elevation > max_ele) ? new_point.elevation : max_ele;
					min_ele = (new_point.elevation < min_ele) ? new_point.elevation : min_ele;
				} else {
					max_ele = new_point.elevation;
					min_ele = new_point.elevation;
					arr_distance_deltas.push(0);
					arr_distance_aggrs.push(0);
					arr_time_deltas.push(0);
					arr_time_aggrs.push(0);
				}
				prev_lat = new_point.latitude;
				prev_lon = new_point.longitude;
				prev_time = new_point.time;
				new_sequence.points.push(new_point);
			}
			// stats
			new_sequence['arr_distance_deltas'] = arr_distance_deltas;
			new_sequence['arr_distance_aggrs'] = arr_distance_aggrs;
			new_sequence['arr_time_deltas'] = arr_time_deltas;
			new_sequence['arr_time_aggrs'] = arr_time_aggrs;
			new_sequence['is_plotted'] = false;
			new_sequence['has_outliers'] = false;
			new_sequence['matches_file'] = true;
			new_sequence['total_distance'] = new_sequence.arr_distance_aggrs[arr_distance_aggrs.length - 1];
			new_sequence['total_time'] = new_sequence.arr_time_aggrs[arr_time_aggrs.length - 1];
			new_sequence['start_time'] = new_sequence.points[0].time;
			new_sequence['maximum_elevation'] = max_ele;
			new_sequence['minimum_elevation'] = min_ele;

			// identify outliers
			let distance_zscores = this.zScores(arr_distance_deltas);
			let time_zscores = this.zScores(arr_time_deltas);
			let outliers_distances_indicies = [], outliers_distances_zscores = {};
			distance_zscores.forEach(function (score, index) {
				if (score > 25) {
					outliers_distances_indicies.push(index);
					outliers_distances_zscores[index] = score;
				}
			});
			let outliers_times_indicies = [], outliers_times_zscores = {};
			time_zscores.forEach(function (score, index) {
				if (score > 25) {
					outliers_times_indicies.push(index);
					outliers_times_zscores[index] = score;
				}
			});

			// find the intersection of the distance outliers and the time outliers (by index)
			outliers_times_indicies.filter(index => outliers_distances_indicies.includes(index));

			if (outliers_times_indicies.length > 0) {

				new_sequence.name = 'ORIG ' + new_sequence.name;
				new_sequence['has_outliers'] = true;
				this.sequences.push(new_sequence);

				let outliers_d_zscores = [], outliers_t_zscores = [];
				for (let o of outliers_times_indicies) {
					outliers_d_zscores.push(distance_zscores[o]);
					outliers_t_zscores.push(time_zscores[o]);
				}
				// this pass, split on the biggest outlier
				// eslint-disable-next-line no-console
				console.log('common indicies: ', outliers_times_indicies);
				// eslint-disable-next-line no-console
				console.log('d scores: ', outliers_d_zscores);
				// eslint-disable-next-line no-console
				console.log('t scores: ', outliers_t_zscores);
				let splice_idx = outliers_times_indicies[this.get_index_of_common_maximum (outliers_d_zscores, outliers_t_zscores)];
				// eslint-disable-next-line no-console
				console.log('splice_idx: ', splice_idx);
				let new_length, new_max_elevation, new_min_elevation;

				// create a new sequence from before the split index
				let part1_new_sequence = JSON.parse(JSON.stringify(new_sequence));
				part1_new_sequence.has_outliers = false;
				part1_new_sequence['matches_file'] = false;
				part1_new_sequence.filename = 'N/A (this is only part of an imported file)';
				uuid = this.generate_uuidv4();
				part1_new_sequence['uuid'] = uuid;
				part1_new_sequence.name = 'PART1 ' + part1_new_sequence.name.replace('ORIG ', '');
				part1_new_sequence.points.splice(splice_idx);
				new_length = part1_new_sequence.points.length;
				part1_new_sequence.arr_distance_deltas.splice(splice_idx);
				part1_new_sequence.arr_distance_aggrs.splice(splice_idx);
				part1_new_sequence.total_distance = part1_new_sequence.arr_distance_aggrs[new_length - 1];
				part1_new_sequence.arr_time_deltas.splice(splice_idx);
				part1_new_sequence.arr_time_aggrs.splice(splice_idx);
				part1_new_sequence.total_time = part1_new_sequence.arr_time_aggrs[new_length - 1];
				// new subset of points, so redo the calculations
				new_max_elevation = part1_new_sequence.points[0].elevation;
				new_min_elevation = part1_new_sequence.points[0].elevation;
				part1_new_sequence.points.forEach(function(point) {
					if (point.elevation > new_max_elevation) {
						new_max_elevation = point.elevation;
					}
					if (point.elevation < new_min_elevation) {
						new_min_elevation = point.elevation;
					}
				});
				part1_new_sequence.maximum_elevation = new_max_elevation;
				part1_new_sequence.minimum_elevation = new_min_elevation;
				this.sequences.push(part1_new_sequence);

				// create a new sequence starting with the split index
				let part2_new_sequence = JSON.parse(JSON.stringify(new_sequence));
				part2_new_sequence.has_outliers = false;
				part2_new_sequence['matches_file'] = false;
				part2_new_sequence.filename = 'N/A (this is only part of an imported file)';
				uuid = this.generate_uuidv4();
				part2_new_sequence['uuid'] = uuid;
				part2_new_sequence.name = 'PART2 ' + part2_new_sequence.name.replace('ORIG ', '');
				part2_new_sequence.points.splice(0, splice_idx);
				new_length = part2_new_sequence.points.length;
				part2_new_sequence.arr_distance_deltas.splice(0, splice_idx);
				part2_new_sequence.arr_distance_aggrs.splice(0, splice_idx);
				let offset_distance = part2_new_sequence.arr_distance_aggrs[0];
				part2_new_sequence.arr_distance_aggrs.forEach(function(ele, idx) {
					this[idx] -= offset_distance;
				}, part2_new_sequence.arr_distance_aggrs);
				part2_new_sequence.total_distance = part2_new_sequence.arr_distance_aggrs[new_length - 1];
				part2_new_sequence.arr_time_deltas.splice(0, splice_idx);
				part2_new_sequence.arr_time_aggrs.splice(0, splice_idx);
				let offset_time = part2_new_sequence.arr_time_aggrs[0];
				part2_new_sequence.arr_time_aggrs.forEach(function(ele, idx) {
					this[idx] -= offset_time;
				}, part2_new_sequence.arr_time_aggrs);
				part2_new_sequence.total_time = part2_new_sequence.arr_time_aggrs[new_length - 1];
				part2_new_sequence['start_time'] = part2_new_sequence.points[0].time;
				// new subset of points, so redo the calculations
				new_max_elevation = part2_new_sequence.points[0].elevation;
				new_min_elevation = part2_new_sequence.points[0].elevation;
				part2_new_sequence.points.forEach(function(point) {
					if (point.elevation > new_max_elevation) {
						new_max_elevation = point.elevation;
					}
					if (point.elevation < new_min_elevation) {
						new_min_elevation = point.elevation;
					}
				});
				part2_new_sequence.maximum_elevation = new_max_elevation;
				part2_new_sequence.minimum_elevation = new_min_elevation;

				this.sequences.push(part2_new_sequence);

			} else {
				this.sequences.push(new_sequence);
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


		// https://gist.github.com/Daniel-Hug/7273430

		sum: function(array) {
			var num = 0;
			for (var i = 0, l = array.length; i < l; i++) num += array[i];
			return num;
		},
    
		mean: function(array) {
			return this.sum(array) / array.length;
		},

		median: function(array) {
			let cloned_array = [...array]; // to preserve the original order
			cloned_array.sort(function(a, b) {
				return a - b;
			});
			var mid = cloned_array.length / 2;
			return mid % 1 ? cloned_array[mid - 0.5] : (cloned_array[mid - 1] + array[mid]) / 2;
		},
    
		variance: function(array) {
			var median = this.median(array);
			return this.median(array.map(function(num) {
				return Math.pow(num - median, 2);
			}));
		},
    
		standardDeviation: function(array) {
			return Math.sqrt(this.variance(array));
		},

		medianAbsoluteDeviation: function(array) {
			var median = this.median(array);
			return this.median(array.map(function(num) {
				return Math.abs(num - median);
			}));
		},
    
		zScores: function(array) {
			var median = this.median(array);
			var standardDeviation = this.standardDeviation(array);
			return array.map(function(num) {
				return parseFloat(((num - median) / standardDeviation).toFixed(2));
			});
		},

		get_index_of_common_maximum: function(arr1, arr2) {
			if (arr1.length !== arr2.length) {
				return null;
			}
			let sorted_arr1 = [...arr1].sort();
			let sorted_arr2 = [...arr2].sort();
			let results = [];
			for (let ele=sorted_arr1.length-1; ele>=0; ele--){
				let arr1_idx = arr1.indexOf(sorted_arr1[ele]);
				if (results.includes(arr1_idx)) {
					// eslint-disable-next-line no-console
					console.log('RETURNING: ' + arr1_idx);
					return arr1_idx;
				} else {
					results.push(arr1_idx);
				}
				let arr2_idx = arr2.indexOf(sorted_arr2[ele]);
				if (results.includes(arr2_idx)) {
					// eslint-disable-next-line no-console
					console.log('RETURNING: ' + arr2_idx);
					return arr2_idx;
				} else {
					results.push(arr2_idx);
				}
			}
			return null;
		},
		clickedDeleteSequence: function (sequence_uuid) {
			// removeSequenceFromChart(sequence_num);
			this.sequences = this.sequences.filter(function (obj) {
				return obj.uuid !== sequence_uuid;
			});
		},
		clickedPlotSequence: function (sequence_uuid) {
			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			if (this.sequences[sequence_num].is_plotted) {
				// removeSequenceFromChart(sequence_num);
			} else {
				// addSequenceToChart(this.sequences[sequence_num]);
			}
			this.sequences[sequence_num].is_plotted = !this.sequences[sequence_num].is_plotted;
		},
		acknowledgeInfo: function (sequence_uuid) {
			let sequence_num = this.sequences.findIndex(s => s.uuid === sequence_uuid);
			this.sequences[sequence_num].has_outliers = false;
			this.sequences[sequence_num].matches_file = true;
		}
	},
	computed: {
		//   distances: function() {
		//       let distances = [];
		//       let factor = (this.units === 'english') ? 0.621371 : 1;
		//       for (let s of this.sequences) {
		//           distances.push(s.total_distance * factor);
		//       }
		//   }
	}
};
</script>

<style scoped>
</style>
