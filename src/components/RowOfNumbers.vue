<template>
	<div class="row_of_numbers">
        <div class="number text-right">{{ seconds_to_hm(sequence.total_time) }}</div>
        <div class="number text-center">{{ to_desired_units("km", sequence.total_distance) | to_tenths }}</div>
        <div class="number text-right">{{ seconds_to_hms(to_desired_units("secsperkm", sequence.average_pace)) }}</div>
        <div class="number text-right">{{ to_desired_units("m", sequence.minimum_elevation) | round_it }}</div>
        <div class="number text-right">{{ to_desired_units("m", sequence.maximum_elevation) | round_it }}</div>
	</div>
</template>


<script>

export default {
	props: ['sequence', 'units', 'epoch_to_timestring', 'epoch_to_datestring'],
	data() {
		return {
		};
	},
	methods: {
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
    .row_of_numbers {
        display: flex;
        justify-content: space-evenly;
    }
    .numbers {
        flex: 0 0 20%;
    }
</style>