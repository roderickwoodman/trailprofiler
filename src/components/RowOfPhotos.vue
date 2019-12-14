<template>
    <div class="row_of_photos">
        <div v-bind:key="photo.uuid" v-for="photo in sorted_photos" class="photo_container">
            <img :src="photo.filename">
            <figcaption v-if="time_format === 'epoch'">{{ photo.datetime }}</figcaption>
            <figcaption v-if="time_format !== 'epoch'">{{epoch_to_datestring(photo.datetime)}}</figcaption>
            <figcaption v-if="time_format !== 'epoch'">{{epoch_to_timestring(photo.datetime)}}</figcaption>
            <figcaption>{{photo.camera}}</figcaption>
        </div>
    </div>
</template>


<script>

export default {
	props: ['row_photos', 'time_format', 'epoch_to_datestring', 'epoch_to_timestring'],
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
    }
    .photo_container {
        width: 125px;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items:center;
        margin: 5px;
    }
    figcaption {
        font-size: 0.8em;
    }
</style>