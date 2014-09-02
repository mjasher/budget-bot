function draw_table(){

//  html table would probably look better than svg but fixed width table cells are a pain, 

// table{
//     table-layout: fixed;
//     width: 200px; 
// }
// th, td{
//   overflow: hidden;
// }
// <table>
//     <col style='width: 150px;'/>
//     <col style='width: 50px;'/>
//    <tr>
//       <th>header 1</th>
//       <th>header 234567895678657</th>
//    </tr>
//    <tr>
//       <td >data asdfasdfasdfasdfasdf</td>
//       <td >data 2</td>
//    </tr>
// </table>


  var unique_dates_values = unique_dates.values(); // TODO sort
	
  var w = document.getElementById('graph').clientWidth,
    margin = {top: 40, right: 120, bottom: 20, left: 120};

  x.rangeRoundBands([0, w - margin.left - margin.right],.1)
        .domain(unique_dates_values);

  // var table_width = 120 + x.rangeBand() + (x.range()[x.range().length-1] - x.range()[0]);
  var table_width = 120 + 10*x.rangeBand()*unique_dates_values.length/9


  console.log('rangeasdfa',x(unique_dates_values[0]), x(unique_dates_values[unique_dates_values.length-1]))

  var table = d3.select('#table').append("table")
                            .style('padding-left', (margin.left+x.range()[0])+'px')
                            .style('table-layout','fixed')
                            .style('width', table_width+'px'),
        thead = table.append("thead"),
        tbody = table.append("tbody");

             var prefix = d3.format(',.0f');

    thead.append("tr")
        .selectAll("th")
        // .data([' '].concat(unique_dates_values))
        .data(unique_dates_values)
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
          // return [d].concat(row);
          return row;
         })
        .enter()
        .append('td')
        .text( function(d,i) {
            // if (i==0) return d;
            return prefix(d).replace(',',' '); 
            return d.toFixed(0); 
        })

    	

		
}