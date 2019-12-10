<template>
	<div class="header_row_for_numbers">
        <div class="headers sortable text-right" @click="do_sort('total_time')">Time</div>
        <div class="headers sortable text-center" @click="do_sort('total_distance')">Distance ({{ units === 'english' ? 'mi' : 'km' }})</div>
        <div class="headers sortable text-right" @click="do_sort('average_pace')">Pace (per {{ units === 'english' ? 'mi' : 'km' }})</div>
        <div class="headers sortable text-right" @click="do_sort('minimum_elevation')">Min Elev. ({{ units === 'english' ? 'ft' : 'm' }})</div>
        <div class="headers sortable text-right" @click="do_sort('maximum_elevation')">Max Elev. ({{ units === 'english' ? 'ft' : 'm' }})</div>
	</div>
</template>


<script>

export default {
	props: ['units', 'do_sort'],
	data() {
		return {
		};
	}
};

</script>


<style scoped>
    .header_row_for_numbers {
        display: flex;
        justify-content: space-evenly;
    }
    .headers {
        flex: 0 0 20%;
    }
    .sortable {
        cursor: pointer;
    }
</style>