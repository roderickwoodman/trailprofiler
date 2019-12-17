<template>
	<div>
	<div class="row_of_photos">
		<div v-if="!row_photos.length" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has no photos </div>
		<div v-bind:key="photo.uuid" v-for="photo in sorted_photos" class="photo_container">
			<img :src="photo.filename">
			<figcaption v-if="time_format === 'epoch'">{{ photo.datetime }}</figcaption>
			<figcaption v-if="time_format !== 'epoch' && show_date">{{epoch_to_datestring(photo.datetime)}}</figcaption>
			<figcaption v-if="time_format !== 'epoch'">{{epoch_to_timestring(photo.datetime)}}</figcaption>
			<figcaption>{{photo.camera}}</figcaption>
		</div>
	</div>
	</div>
</template>


<script>

export default {
	props: ['row_photos', 'time_format', 'epoch_to_datestring', 'epoch_to_timestring', 'show_date'],
	data() {
		return {
		};
	},
	computed: {
		sorted_photos: function() {
			let cloned = [...this.row_photos];
			return cloned.sort(function(a,b) {
				return (a.datetime > b.datetime) ? 1 : -1;
			});
		}
	}
};

</script>


<style scoped>
	.row_of_photos {
		display: flex;
		justify-content: flex-start;
		width: 100%;
		overflow-x: auto;
	}
	.row_of_photos .info_message {
		width: 100%;
		text-align: center;
	}
	.photo_container {
		width: 125px;
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
		align-items:center;
		margin: 5px;
		flex-shrink: 0;
		height: 100%;
	}
	figcaption {
		font-size: 0.8em;
	}
</style>