function draw_table(){

	var table = d3.select('#table').append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    var unique_dates_values = unique_dates.values(); // TODO sort

    thead.append("tr")
        .selectAll("th")
        .data([' '].concat(unique_dates_values))
        .enter()
        .append("th")
        .text(function(d) { return d; });

    // append a cell to each row for each column
    tbody.selectAll("tr")
        .data(color.domain())
        .enter()
        .append("tr")
        .style('background-color', function(d,i) { return color(d); })
        .selectAll("td")
        .data(function(d,i) { 
          // every category should be there as it's top level
          var dates = nested_by_category.get(d); 
          var row = unique_dates_values.map(function(date){ 
          	if (t = dates.get(date)) return t.expenses;
          	else return 0;
          });
          return [d].concat(row);
         })
        .enter()
        .append('td')
        .text( function(d,i) {
            if (i==0) return d;
            return d.toFixed(0); 
        })

    tbody.append('tr')
    	

		
}