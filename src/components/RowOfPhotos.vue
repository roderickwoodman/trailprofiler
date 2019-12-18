<template>
	<div class="row_of_photos">
		<div v-if="!row_photos.length" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has no photos </div>
		<div v-bind:key="photo.uuid" v-for="photo in sorted_photos" class="photo_item">
			<div class="photo_container">
				<img :src="photo.filename">
				<figcaption class="photo_overlay">
					<div>{{ photo.aperture_printable }}</div>
					<div>{{ photo.shutter_printable }}</div>
					<div>{{ photo.iso }}</div>
				</figcaption>
			</div>
			<figcaption v-if="time_format === 'epoch'">{{ photo.datetime }}</figcaption>
			<figcaption v-if="time_format !== 'epoch' && show_date">{{epoch_to_datestring(photo.datetime)}}</figcaption>
			<figcaption v-if="time_format !== 'epoch'">{{epoch_to_timestring(photo.datetime)}}</figcaption>
			<figcaption v-if="show_details" class="camera">{{photo.camera_model}}</figcaption>
		</div>
	</div>
</template>


<script>

export default {
	props: ['row_photos', 'time_format', 'epoch_to_datestring', 'epoch_to_timestring', 'show_date', 'show_details'],
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
	.photo_item {
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
		align-items:center;
		margin: 5px;
		flex-shrink: 0;
		width: 100px;
		height: 100%;
		text-align: center;
	}
	.photo_container {
		width: 75px;
		height: 75px;
		position: relative;
		background-color: black;
	}
	.photo_container > img {
		opacity: 0.7;
		width: 100%;
		height: 100%;
	}
	.photo_overlay {
		position: absolute;
		top: 0;
		left: 0;
		padding: 5px;
		color: white;
		font-size: 0.7em;
		font-weight: 800;
		text-align: left;
	}
	figcaption {
		font-size: 0.8em;
	}
</style>