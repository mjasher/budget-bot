function draw_bars(){
    
  var w = document.getElementById('graph').clientWidth,
  	h = 150,
    margin = {top: 20, right: 120, bottom: 40, left: 120},
    mini_x = d3.scale.ordinal().rangeRoundBands([0, w - margin.left - margin.right],.1)
        .domain(unique_dates_values);

  d3.select('#graph svg').remove();
  var graph = d3.select('#graph').append("svg")
          .attr('width', w)
          .attr('height',h)
          .append('g')
          .attr('transform', 'translate('+margin.left+','+margin.top+')');
    
  // stack the categories - could use d3.layout.stack but isn't confusing enough as is
	var stacked_categories = unique_dates_values.map(function(d){
		var y0 = 0;
		return filtered_categories.filter(function(cat){ return cat != 'TOTAL'; }).reverse().map(function(cat){
			if (val = nested_by_category.get(cat).get(d)) {
				return { category: cat, y0: y0, y1: y0 += val.expenses}
			}
			else return 0;
		}).filter(function(val){ return val != 0; });
	});


  var y_domain = [0, d3.max(stacked_categories.map(function(p){ return p[p.length-1].y1; }))];
	var y = d3.scale.linear().range([h - margin.top - margin.bottom, 0] )
            .domain(y_domain);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var bar = graph.selectAll(".bar")
      .data(unique_dates_values) // or x.domain()
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + mini_x(d) + ",0)"; }) // (x(d) + x.rangeBand()/2)
      


	 var rect = bar.selectAll("rect")
	    .data(function(d,i){ return stacked_categories[i]; })
	    .enter().append("rect")
	      .attr("width", mini_x.rangeBand())
	      .attr("y", function(d) { return y(d.y1); })
	      .attr("height", function(d) { return (y(d.y0) - y(d.y1)); })
	      .style("fill", function(d) { return color(d.category); });

    bar.append("svg:text")
      // .attr("text-anchor", "middle")
      // .attr('transform',function(d){ return 'translate('+ (x(d)+x.rangeBand()) +',0)rotate(-60)';})
      .attr('transform','translate(0,'+(h-20)+')rotate(-60)')
      .text(function(d){return d;});


  var yAxis = d3.svg.axis()
    .scale(y)
    // .scale( d3.scale.linear().range([h - margin.top - margin.bottom,0]))
    .orient("right")
    .tickFormat(d3.format(".2s"));

  graph.append("g")
      .attr('transform', 'translate('+(w-margin.left-margin.right)+',0)')
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -12)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Expenditure ($)");


  // Create brush for mini graph
    var brush = d3.svg.brush()
        .x(mini_x)
        .on("brush", brushed);
        
    // Add the brush
    graph.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -10)
        .attr("height", h + 15);


// var cells = d3.selectAll('#table text.cell');
// var thead = d3.selectAll('#table .thead text');
    function brushed() {
    // for ordinal scale, we could change to time axis and http://bl.ocks.org/mbostock/1849162
    // but rangeBands is really handy and real dates can't be used as keys in maps so we'd need to new Date(key) often
    // x.domain(brush.empty() ? mini_x.domain() : brush.extent());

    // x.domain(brush.empty() ? mini_x.domain() : mini_x.domain().filter(function(d){return (brush.extent()[0] <= mini_x(d)) && (mini_x(d) <= brush.extent()[1])}) );
    // think about where you want the lower and upper bounds to map to, 
    

    var ww = w-margin.left-margin.right;
    x.rangeRoundBands((brush.empty() ? mini_x.range() : [0-brush.extent()[0]*ww/((brush.extent()[1]-brush.extent()[0])), (ww-brush.extent()[0])*ww/((brush.extent()[1]-brush.extent()[0])) ] ),.1  );


    table_brush();

    // d3.select(".selected").text(selected.join(","));},
    // brush =   d3.svg.brush().y(yScale).on("brush",brushed); 
        // bar.attr("transform", function(d) { return "translate(" + (main_x(new Date(d.key))-main_width/len/4) + ",0)"; });
        // rect.attr("width", main_width/len/2);
        // main.select(".x.axis").call(main_xAxis);
    }


}