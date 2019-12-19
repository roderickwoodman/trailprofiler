<template>
	<div>
		<div v-if="!row_photos.length" class="info_message"><font-awesome-icon icon="info-circle" /> this sequence has no photos </div>
		<div v-if="row_photos.length">
			<ul class="camera_list" v-bind:key="camera" v-for="(count, camera) in camera_counts">
				<li class="camera" v-bind:class="{ excluded: excluded_cameras.includes(camera) }" @click="toggleCameraInclusion(camera)">{{ count }} x {{ camera }}</li>
			</ul>
			<div class="row_of_photos">
				<div v-bind:key="photo.uuid" v-for="photo in sorted_photos" class="photo_item">
					<div class="photo_container">
						<img :src="photo.filename" v-bind:class="{darkened: show_image_specs}">
						<figcaption v-if="show_image_specs" class="photo_overlay">
							<div>{{ photo.aperture_printable }}</div>
							<div>{{ photo.shutter_printable }}</div>
							<div>{{ photo.iso }}</div>
						</figcaption>
					</div>
					<figcaption v-if="time_format === 'epoch'">{{ photo.datetime }}</figcaption>
					<figcaption v-if="time_format !== 'epoch' && show_date">{{epoch_to_datestring(photo.datetime)}}</figcaption>
					<figcaption v-if="time_format !== 'epoch'">{{epoch_to_timestring(photo.datetime)}}</figcaption>
					<figcaption v-if="show_details">{{photo.camera_model}}</figcaption>
				</div>
			</div>
		</div>
	</div>
</template>


<script>

export default {
	props: ['row_photos', 'excluded_cameras', 'time_format', 'epoch_to_datestring', 'epoch_to_timestring', 'show_date', 'show_details', 'show_image_specs', 'toggleCameraInclusion'],
	data() {
		return {
		};
	},
	computed: {
		sorted_photos: function() {
			let cloned = [...this.row_photos];
			let filtered = cloned.filter(photo => !photo.hasOwnProperty('camera_model') || !this.excluded_cameras.includes(photo.camera_model));
			return filtered.sort(function(a,b) {
				return (a.datetime > b.datetime) ? 1 : -1;
			});
		},
		camera_counts: function() {
			let counts = {};
			for (let photo of this.row_photos) {
				if (photo.has_exif_data && counts.hasOwnProperty(photo.camera_model)) {
					counts[photo.camera_model] += 1;
				} else {
					counts[photo.camera_model] = 1;
				}
			}
			return counts;
		}
	},

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
		width: 100%;
		height: 100%;
	}
	.photo_container > img.darkened {
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
	.camera_list {
		display: inline-block;
		margin: 0;
		margin-right: 15px;
		padding: 0;
		list-style: none;
		font-size: 0.8em;
	}
	.camera {
		padding: 1px 5px;
	}
	.camera:hover {
		cursor: pointer;
	}
	.camera.excluded {
		text-decoration: line-through;
		border: 0;
	}
</style>