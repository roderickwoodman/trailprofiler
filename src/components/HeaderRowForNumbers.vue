<template>
	<div class="header_row_for_numbers">
		<div class="headers sortable text-center" @click="do_sort('total_time')">
			<div>
				<span>Time</span>
				<span v-if="sort_key==='total_time' && sort_dir_asc">&#9660;</span>
				<span v-if="sort_key==='total_time' && !sort_dir_asc">&#9650;</span>
			</div>
		</div>
		<div class="headers sortable text-center" @click="do_sort('total_distance')">
			<div>
				<span>
					<span class="linebreak">Distance</span>
					<span class="linebreak">({{ units === 'imperial' ? 'mi' : 'km' }})</span>
				</span>
				<span v-if="sort_key==='total_distance' && sort_dir_asc">&#9660;</span>
				<span v-if="sort_key==='total_distance' && !sort_dir_asc">&#9650;</span>
			</div>
		</div>
		<div class="headers sortable text-center" @click="do_sort('average_pace')">
			<div>
				<span>
					<span class="linebreak">Pace</span>
					<span class="linebreak">(per {{ units === 'imperial' ? 'mi' : 'km' }})</span>
				</span>
				<span v-if="sort_key==='average_pace' && sort_dir_asc">&#9660;</span>
				<span v-if="sort_key==='average_pace' && !sort_dir_asc">&#9650;</span>
			</div>
		</div>
		<div class="headers sortable text-right" @click="do_sort('minimum_elevation')">
			<div>
				<span>
					<span class="linebreak">Min Elev.</span>
					<span class="linebreak">({{ units === 'imperial' ? 'ft' : 'm' }})</span>
				</span>
				<span v-if="sort_key==='minimum_elevation' && sort_dir_asc">&#9660;</span>
				<span v-if="sort_key==='minimum_elevation' && !sort_dir_asc">&#9650;</span>
			</div>
		</div>
		<div class="headers sortable text-right" @click="do_sort('maximum_elevation')">
			<div>
				<span>
					<span class="linebreak">Max Elev.</span>
					<span class="linebreak">({{ units === 'imperial' ? 'ft' : 'm' }})</span>
				</span>
				<span v-if="sort_key==='maximum_elevation' && sort_dir_asc">&#9660;</span>
				<span v-if="sort_key==='maximum_elevation' && !sort_dir_asc">&#9650;</span>
			</div>
		</div>
	</div>
</template>


<script>

export default {
	props: ['units', 'do_sort', 'sort_key', 'sort_dir_asc'],
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
	.sortable > div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>