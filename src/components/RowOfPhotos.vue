<template>
    <div class="row_of_photos">
        <div class="photo" v-for="photo in row_photos" v-bind:key="photo.uuid">
            <div class="photo_container">
                <img :src="photo.filename">
                <figcaption>{{photo.datetime}}</figcaption>
                <figcaption>{{epoch_to_datestring(photo.datetime)}}</figcaption>
                <figcaption>{{epoch_to_timestring(photo.datetime)}}</figcaption>
                <figcaption>{{photo.camera}}</figcaption>
            </div>
        </div>
    </div>
</template>


<script>

export default {
	props: ['row_photos', 'epoch_to_datestring', 'epoch_to_timestring'],
	data() {
		return {
		};
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