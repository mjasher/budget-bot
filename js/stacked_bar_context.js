 function draw(){
    // Chart dimensions
    var main_margin = {top: 20, right: 150, bottom: 100, left: 60},
        mini_margin = {top: 20, right: 50, bottom: 20, left: 60},
        main_width  = document.getElementById('graph').clientWidth - main_margin.left - main_margin.right,
        mini_width  = document.getElementById('graph').clientWidth - mini_margin.left - mini_margin.right,
        main_height = 400 - main_margin.top - main_margin.bottom,
        mini_height = 100 - mini_margin.top - mini_margin.bottom;;


    // The label for the Y axis
    var yLabel = "Spending ($)";

    var interval = d3.time.week;
    var format = d3.time.format("%d-%b");

    // The date format
    var mini_interval = d3.time.month; // https://github.com/mbostock/d3/wiki/Time-Intervals
    var mini_format = d3.time.format("%b");

    var main_interval = d3.time.week;
    var main_format = d3.time.format("%d-%b"); 


    function rollup(leaves){ 
        return {
                    "length": leaves.length, 
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
    var nested_data = d3.nest()
        .key(function(d) { return interval(d.date); })
        .key(function(d) { return d.category; })
        .rollup(rollup)
        .map(categorized, d3.map);
        // .entries(categorized);

    junk = nested_data;

    // stack the categories
    nested_data.keys().forEach(function(d) {
        var p = nested_data.get(d);
        var y0 = 0;
        p.categories = p.keys().map(function(cat) { return {category: cat, y0: y0, y1: y0 += +p.get(cat).expenses}; });
        p.total = p.categories[p.categories.length - 1].y1;
    });

    // data.sort(function(a, b) { return b.total - a.total; });
    // junk = nested_data;

    // Define main svg element in #graph
    var svg = d3.select("#graph").append("svg")
        .attr("width", main_width + main_margin.left + main_margin.right)
        .attr("height", main_height + main_margin.top + main_margin.bottom);

    var mini_svg = d3.select("#graph").append("svg")
        .attr("width", mini_width + mini_margin.left + mini_margin.right)
        .attr("height", mini_height + mini_margin.top + mini_margin.bottom);

    // Add the clip path
    // svg.append("defs").append("clipPath")
    //     .attr("id", "clip")
    //   .append("rect")
    //     .attr("width", main_width - axis_offset)
    //     .attr("height", main_height);

    var main = svg.append("g")
        .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")");

    var mini = mini_svg.append("g")
        .attr("transform", "translate(" + mini_margin.left + "," + mini_margin.top + ")");

    var y_domain = [0, d3.max(nested_data.values().map(function(p){ return p.total; }))];
    var main_y  = d3.scale.linear().range([main_height, 0] )
            .domain(y_domain);
    var mini_y  = d3.scale.linear().range([mini_height, 0] )
            .domain(y_domain);

    var main_yAxis = d3.svg.axis()
        .scale(main_y)
        .orient("left");


        // x = d3.scale.ordinal().rangeRoundBands([0, main - margin.left - margin.right],.1),

    // necessary because above makes date strings
    // var main_x = d3.time.scale()
                // .range([0, main_width])
    var main_x = d3.scale.ordinal()
                    .rangeRoundBands([0, main_width])
                    .domain(d3.extent(categorized.map(function(row){ return interval(row.date); })))
    var mini_x = d3.scale.ordinal()
                    .rangeRoundBands([0, mini_width])
                    .domain(main_x.domain())


    // unique set of categories
    var unique_keys = d3.set();
    for (var i = 0; i < categorized.length; i++) {
        unique_keys.add(categorized[i].category);
    };

    var color = d3.scale.category20()
            .domain(unique_keys.values());

 
    // Create brush for mini graph
    var brush = d3.svg.brush()
        .x(mini_x)
        .on("brush", brushed);


  var nested_data_values = nested_data.values();    
    // Create the bars
  var bar = main.selectAll(".bar")
      .data(main_x.domain)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(" + (main_x(d) + main_x.rangeBand()/2) + ",0)"; })
      .append("svg:text")
//       .attr('transform', function(d){ return 'translate('+ (main_x(d) + main_x.rangeBand()/2) +','+main_height+')rotate(-45)'; })
      .attr("text-anchor", "middle")
      .text(main_format);

// main.selectAll("text")
//       .data(main_x.domain())
//     .enter().append("svg:text")
//       .attr('transform', function(d){ return 'translate('+ (main_x(d) + main_x.rangeBand()/2) +','+main_height+')rotate(-45)'; })
//       .attr("text-anchor", "middle")
//       .text(main_format);


  var rect = bar.selectAll("rect")
      .data(function(d) { console.log(d.toISOString()); return nested_data.get(d.toISOString()).categories; })
    .enter().append("rect")
      .attr("width", main_x.rangeBand())
      .attr("y", function(d) { return main_y(d.y1); })
      .attr("height", function(d) { return main_y(d.y0) - main_y(d.y1); })
      .style("fill", function(d) { return color(d.category); });

  var mini_bar = mini.selectAll(".mini_bar")
      .data(nested_data.entries())
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + (mini_x(new Date(d.key))-mini_width/nested_data_values.length/4) + ",0)"; });

  mini_bar.selectAll("rect")
      .data(function(d) { return d.value.categories; })
    .enter().append("rect")
      .attr("width", mini_x.rangeBand())
      .attr("y", function(d) { return mini_y(d.y1); })
      .attr("height", function(d) { return mini_y(d.y0) - mini_y(d.y1); })
      .style("fill", function(d) { return color(d.category); });


    // Define the X axis
    // var main_xAxis = d3.svg.axis()
    //     .scale(main_x)
    //     .ticks(10)
    //     .orient("bottom");

    // var mini_xAxis = d3.svg.axis()
    //     .scale(mini_x)
    //     .ticks(10)
    //     .orient("bottom");

    // Add the X axis
    // main.append("g")
    //     .attr("class", "x axis")
    //     .attr("clip-path", "url(#clip)")
    //     .attr("transform", "translate(0," + main_height + ")")
    //     .call(main_xAxis);

    // mini.append("g")
    //     .attr("class", "x axis mini_axis")
    //     .attr("clip-path", "url(#clip)")
    //     .attr("transform", "translate(0," + mini_height + ")")
    //     .call(mini_xAxis);

      // Add a label per date.
  main.selectAll("text")
      .data(main_x.domain())
    .enter().append("svg:text")
      .attr('transform', function(d){ return 'translate('+ (main_x(d) + main_x.rangeBand()/2) +','+main_height+')rotate(-45)'; })
      .attr("text-anchor", "middle")
      .text(main_format);

    // Add the Y axis
    main.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(main_yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yLabel)
        .attr("class","y_label");


    // Add the brush
    mini.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -10)
        .attr("height", mini_height + 15);

    var nested_data_keys = nested_data.keys().map(function(d){ return new Date(d); });

    function brushed() {
        //main_x.domain(d3.extent(data.result, xValue));
        main_x.domain(brush.empty() ? mini_x.domain() : brush.extent());
        
        var len = nested_data_keys.filter(function(d){ 
            return ( d > brush.extent()[0] && d < brush.extent()[1] );
        }).length;

        // TODO width as determined by brush_ext/width

        if (len > 0){
            bar.attr("transform", function(d) { return "translate(" + (main_x(new Date(d.key))-main_width/len/4) + ",0)"; });
            rect.attr("width", main_width/len/2);
        }

        main.select(".x.axis").call(main_xAxis);
    }

      // var legend = d3.select('#graph')
      var legend = main.append('svg')
          .selectAll(".legend")
          .data(color.domain())
          // .data(color.domain().slice().reverse())
          .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate("+(main_width+main_margin.right-mini_margin.right)+"," + i * 20 + ")"; });

      legend.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", -2)
          .attr("y", -5)
          // .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

}


