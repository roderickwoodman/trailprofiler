<template>

    <div class="container table-responsive-sm p-0">
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th>Date - Time</th>
                    <th>Filename</th>
                    <th>Camera</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="photo.uuid" v-for="photo in photos">
                    <td>{{ photo.exif.DateTime | to_datetimestring_from_ymdhms }}</td>
                    <td>{{ photo.filename }}</td>
                    <td>{{ photo.exif.Make }} {{ photo.exif.Model }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>

export default {
	props: ['photos'],
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