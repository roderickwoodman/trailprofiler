<template>
    <div class="row_of_photos">
        <div class="photo" v-for="photo in row_photos" v-bind:key="photo.uuid">
            <img :src="photo.filename">
        </div>
    </div>
</template>


<script>

export default {
	props: ['row_photos'],
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
</style>