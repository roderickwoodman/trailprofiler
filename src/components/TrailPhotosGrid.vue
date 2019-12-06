<template>

    <div class="container table-responsive-sm p-0">
        <table class="table table-sm">
            <thead>
                <tr>
                    <th @click="do_sort('epoch_time')">Date - Time</th>
                    <th @click="do_sort('filename')">Filename</th>
                    <th @click="do_sort('camera')">Camera</th>
                    <th @click="do_sort('iso')">ISO</th>
                    <th @click="do_sort('aperture')">Aperture</th>
                    <th @click="do_sort('shutter')">Shutter</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="photo.uuid" v-for="photo in sortedPhotos" v-bind:class="{ hasInfo: !photo.has_exif_data, acknowledged: photo.acknowledged }">
                    <td>{{ epoch_to_datestring(photo.epoch_time) }}
                    - {{ epoch_to_timestring(photo.epoch_time) }}</td>
                    <td>{{ photo.filename }}
                            <span v-if="!photo.has_exif_data && !photo.acknowledged" class="info_message"><font-awesome-icon icon="info-circle" /> this file has no EXIF data - <a href="" v-on:click="acknowledgeInfo(photo.uuid)">Dismiss</a></span>
                            </td>
                    <td>{{ photo.camera }}</td>
                    <td>{{ photo.iso }}</td>
                    <td>{{ photo.aperture }}</td>
                    <td>{{ photo.shutter_printable }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>

export default {
	props: ['photos', 'epoch_to_timestring', 'epoch_to_datestring', 'acknowledgeInfo'],
	data() {
		return {
			epoch: 0,
			sort_key: 'epoch_time',
			sort_dir_asc: true
		};
	},
	computed: {
		sortedPhotos: function() {
			let cloned = [...this.photos];
			let key = this.sort_key;
			let direction_asc = this.sort_dir_asc;
			return cloned.sort(function(a,b) {
				if (direction_asc === true) {
					return (a[key] < b[key]) ? 1 : -1;
				} else {
					return (a[key] > b[key]) ? 1 : -1;
				}
			});
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
		}
	},
	filters: {
		to_datetimestring_from_ymdhms: function (ymdhms) { // expect "yyyy:mm:dd hh:mm:ss"
			if (!ymdhms) return '';
			let params = ymdhms.replace(' ',':').split(':');
			params[1] = parseInt(params[1]) - 1;
			let date = new Date(...params);
			const leadingZero = (num) => (0 + num.toString()).slice(-2);
			const formatTime = function(date) {
				return [date.getHours(), date.getMinutes(), date.getSeconds()].map(leadingZero).join(':');
			};
			return date.toDateString() + ' - ' + formatTime(date);
		}
	}
};

</script>


<style scoped>
</style>