<template>

    <div class="container table-responsive-sm p-0">
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th>File</th>
                    <th>Camera</th>
                </tr>
            </thead>
            <tbody>
                <tr v-bind:key="photo.uuid" v-for="photo in photos">
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
};

</script>


<style scoped>
</style>