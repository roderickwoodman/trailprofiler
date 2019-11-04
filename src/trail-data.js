





function removeSequenceFromChart(sequence_num) {
    let new_chart_data = JSON.parse(JSON.stringify(vm.chart_data));
    for ([index,series] of vm.chart_data.series.entries()) {
        if (series.name === vm.sequences[sequence_num].name) {
            new_chart_data.series.splice(index, 1);
            break;
        }
    }
    vm.chart_data = new_chart_data;
    chart.update(vm.chart_data, vm.chart_options);
}

function addSequenceToChart(sequence) {
    let new_chart_data = vm.chart_data, new_series = {}, new_series_data = [];
    new_series["name"] = sequence.name;
    sequence.points.forEach(function(point, idx) {
        let chart_point = { x: sequence.arr_distance_aggrs[idx], y: point.elevation };
        new_series_data.push(chart_point);
    })
    new_series["data"] = new_series_data;
    if (new_chart_data.hasOwnProperty("series")) {
        new_chart_data.series.push(new_series);
    } else {
        new_chart_data["series"] = [new_series];
    }
    vm.chart_data = new_chart_data;
    chart.update(vm.chart_data, vm.chart_options);
}


</script>