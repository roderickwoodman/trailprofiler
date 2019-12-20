<template>
	<div class="header_row_for_numbers">
		<div class="headers sortable text-center" @click="do_sort('total_time')"><span>Time</span></div>
		<div class="headers sortable text-center" @click="do_sort('total_distance')"><span>Distance</span><span>({{ units === 'english' ? 'mi' : 'km' }})</span></div>
		<div class="headers sortable text-center" @click="do_sort('average_pace')"><span>Pace</span><span>(per {{ units === 'english' ? 'mi' : 'km' }})</span></div>
		<div class="headers sortable text-right" @click="do_sort('minimum_elevation')"><span>Min Elev.</span><span>({{ units === 'english' ? 'ft' : 'm' }})</span></div>
		<div class="headers sortable text-right" @click="do_sort('maximum_elevation')"><span>Max Elev.</span><span>({{ units === 'english' ? 'ft' : 'm' }})</span></div>
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
		align-items: center;
	}
	.header_row_for_numbers span {
		display: block;
	}
	.headers {
		flex: 0 0 20%;
	}
	.sortable {
		cursor: pointer;
	}
</style>