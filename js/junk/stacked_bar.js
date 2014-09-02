



function draw() {
    // TODO move to separate (sort data) function
    var w = document.getElementById('graph').clientWidth,
        h = 500,
        margin = {top: 20, right: 120, bottom: 30, left: 40},
        // p = [20, 50, 30, 20],
        x = d3.scale.ordinal().rangeRoundBands([0, w - margin.left - margin.right],.1),
        y = d3.scale.linear().range([0, h - margin.top - margin.bottom]),
        z = d3.scale.category20();

    d3.select("#graph svg").remove();

    var svg = d3.select("#graph").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var inner = svg.append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + (h - margin.top) + ")");

    // The date format
    // var interval = d3.time.month; // https://github.com/mbostock/d3/wiki/Time-Intervals
    // var format = d3.time.format("%b");

    var interval = d3.time.week;
    var format = d3.time.format("%d-%b"); 

    // unique set of categories
    var unique_keys = d3.set();
    for (var i = 0; i < categorized.length; i++) {
        unique_keys.add(categorized[i].category);
    };
    z.domain(unique_keys.values());

    function rollup(leaves){ 
      return {"length": leaves.length, 
              "income": d3.sum(leaves, 
                                function(d) {
                                    if (d.amount > 0) return d.amount;
                                    else return 0;
                                }),
              "expenses": d3.sum(leaves, 
                                function(d) {
                                    if (d.amount < 0) return -1*d.amount;
                                    else return 0;
                                })
            } 
    }

    var nested_by_week = d3.nest()
        .key(function(d) { return interval(d.date); })
        .key(function(d) { return d.category; })
        .rollup(rollup)
        .map(categorized, d3.map);
        // .entries(categorized);

  // Transpose the data into layers by cause.
  var causes = d3.layout.stack()(unique_keys.values().map(function(category) {
    return nested_by_week.keys().map(function(d) {
      if (nested_by_week.get(d).get(category)) return {x: new Date(d), y: nested_by_week.get(d).get(category).expenses};
      else return {x: new Date(d), y: 0};
    });
  }));




  // Compute the x-domain (by date) and y-domain (by top).
  x.domain(causes[0].map(function(d) { return d.x; }));
  y.domain([0, d3.max(causes[causes.length - 1], function(d) { return d.y0 + d.y; })]);

  // Add a group for each cause.
  var cause = inner.selectAll("g.cause")
      .data(causes)
    .enter().append("svg:g")
      .attr("class", "cause")
      .style("fill", function(d, i) { return z(i); })
      .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

  // Add a rect for each date.
  var rect = cause.selectAll("rect")
      .data(Object)
    .enter().append("svg:rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return -y(d.y0) - y(d.y); })
      .attr("height", function(d) { return y(d.y); })
      .attr("width", x.rangeBand());

  // Add a label per date.
  var label = inner.selectAll("text")
      .data(x.domain())
    .enter().append("svg:text")
      .attr('transform', function(d){ return 'translate('+ (x(d) + x.rangeBand() / 2) +',6)rotate(-45)'; })
      .attr("text-anchor", "middle")
      .text(format);

  var yAxis = d3.svg.axis()
    .scale(y)
    // .scale( d3.scale.linear().range([h - margin.top - margin.bottom,0]))
    .orient("left")
    .tickFormat(d3.format(".2s"));

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      // .attr("y", 6)
      // .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Population");


        // var legend = d3.select('#graph')
      var legend = svg.append('g')
          .selectAll(".legend")
          .data(z.domain())
          // .data(color.domain().slice().reverse())
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate("+(w-margin.right)+"," + i * 20 + ")"; });

      legend.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", z);

      legend.append("text")
          .attr("x", -2)
          .attr("y", -5)
          // .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

}