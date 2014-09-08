// model would have brush extent and filtered categories


function visualize(transaction_data){
	var interval = d3.time.week; // 
  // var interval = d3.time.month;

  d3.selectAll('span.interval').html('Week');

  // Create the crossfilter for the relevant dimensions and groups.
  var transactions = crossfilter(transaction_data),
      all = transactions.groupAll(),
      // date = transactions.dimension(function(d) { return d.date; }),
      // dates = date.group(interval), 
      // expense = transactions.dimension(function(d) { return d.debit }),
      // expenses = expense.group(function(d) { return Math.floor(d / 10) * 10; }),      
      // income = transactions.dimension(function(d) { return d.credit }),
      // incomes = income.group(function(d) { return Math.floor(d / 10) * 10; }),
      category_filter = transactions.dimension(function(d) { return d.category; }),
      category = transactions.dimension(function(d) { return d.category; }),
      categories = category.group().reduceSum(function(d){ return d.debit; }),
      category_by_date = transactions.dimension(function(d) { return d.date; }),
      categories_by_date = category_by_date.group(interval).reduce(
        function (p, v) {
            p[v.category] += v.debit;
            return p;
        },
        function (p, v) {
            p[v.category] -= v.debit;
            return p;
        },
        function () {
            var value = {};
            categories.all().forEach(function(d){ 
              value[d.key] = 0;
            });
            return value;
        } 
      ); 

    category_filter.filter(function(d) { return d != 'transfer'; });

    junk = categories_by_date;

    var color = d3.scale.ordinal()
    // var color = d3.scale.category20()
      .domain(categories.all().map(function(d){ return d.key; }))
      .range(["#0c2c84", "#225ea8", "#1d91c0", "#41b6c4", "#7fcdbb", "#c7e9b4", //"#ffffcc",
            '#ffffb2','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#b10026',]);


    // =================
    // draw average by-category
    // =================
    var update_average_by_category = draw_by_category();
    function draw_by_category(){
      var el = d3.select('#avg-by-category');
      var width = el.node().clientWidth;
      var height = 500;


      var all_dates = categories_by_date.all();
      var all_cats;
      var max_cat = 0;
      for (var i = 0; i < all_dates.length; i++) {
        all_cats = Object.keys(all_dates[i].value);
        for (var j = 0; j < all_cats.length; j++) {
          if( max_cat < all_dates[i].value[all_cats[j]] ) max_cat =  all_dates[i].value[all_cats[j]];
        };
        
      };

      var x = d3.scale.ordinal()
          .domain(categories.all().map(function(d){ return d.key; }))
          .rangeRoundBands([0, width - 50 - 50],.1);
      var y = d3.scale.linear()
          // .domain(d3.extent(categories.all().map(function(d){ return d.value; })))
          .domain([0, max_cat])
          .range([height - 10 - 70, 0]);

      el.selectAll('svg').remove();
      var svg = el
          .append('svg')
          .attr('width', width)
          .attr('height', height);
      var graph = svg
          .append('g')
          .attr('transform', 'translate(50,10)');

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

      svg.append("g")
          .attr('transform', 'translate(45,10)')
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Expenditure ($)");

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      svg.append("g")
          .attr('transform', 'translate(50,'+(height-70)+')')
          .attr("class", "x axis")
          .call(xAxis)
          .selectAll('text')
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr('transform', 'rotate(-65)');


      var bars = graph.selectAll('.bar')
          .data(categories.all())
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('width', x.rangeBand())
          // .attr('height', function(d){ return height - 50 - 70 - y(d.value); })
          .attr('fill', function(d){ return color(d.key); });
          // .attr('transform', function(d,i){ return 'translate(' + x(d.key) + ',' + y(d.value) + ')'; });

      return function(intervals){
        bars
          .attr('height', function(d){ return height - 10 - 70 - y(d.value/intervals); })
          .attr('transform', function(d,i){ return 'translate(' + x(d.key) + ',' + y(d.value/intervals) + ')'; });
      }
    }
  
    // TODO almost identical to above

    // =================
    // sum by-category
    // =================
    var update_sum_by_category = draw_sum_by_category();
    function draw_sum_by_category(){
      var el = d3.select('#sum-by-category');
      var width = el.node().clientWidth;
      var height = 500;

      var x = d3.scale.ordinal()
          .domain(categories.all().map(function(d){ return d.key; }))
          .rangeRoundBands([0, width - 50 - 50],.1);
      var y = d3.scale.linear()
          .domain(d3.extent(categories.all().map(function(d){ return d.value; })))
          .range([height - 10 - 70, 0]);

      el.selectAll('svg').remove();
      var svg = el
          .append('svg')
          .attr('width', width)
          .attr('height', height);
      var graph = svg
          .append('g')
          .attr('transform', 'translate(50,10)');

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

      svg.append("g")
          .attr('transform', 'translate(45,10)')
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Expenditure ($)");

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      svg.append("g")
          .attr('transform', 'translate(50,'+(height-70)+')')
          .attr("class", "x axis")
          .call(xAxis)
          .selectAll('text')
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr('transform', 'rotate(-65)');


      var bars = graph.selectAll('.bar')
          .data(categories.all())
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('width', x.rangeBand())
          // .attr('height', function(d){ return height - 50 - 70 - y(d.value); })
          .attr('fill', function(d){ return color(d.key); });
          // .attr('transform', function(d,i){ return 'translate(' + x(d.key) + ',' + y(d.value) + ')'; });

      return function(){
        bars
          .attr('height', function(d){ return height - 10 - 70 - y(d.value); })
          .attr('transform', function(d,i){ return 'translate(' + x(d.key) + ',' + y(d.value) + ')'; });
      }
    }


    // =================
    // draw by-date
    // =================
    draw_by_date()
    function draw_by_date(){
      var el = d3.select('#by-date');
      var width = el.node().clientWidth;
      var height = 300;

      //stack the categories - could use d3.layout.stack but isn't it confusing enough as is
      var stacked_categories = categories_by_date.all().map(function(d){
        var y0 = 0;
        return {
          key: d.key, 
          value: Object.keys(d.value).map(function(cat){
            return { category: cat, y0: y0, y1: y0 += d.value[cat], val: d.value[cat] }
          })    
        }
      });

      var x_domain = d3.extent(categories_by_date.all().map(function(d){ return d.key; }));
      x_domain[1] = interval.offset(x_domain[1],1); // an extra week
      var x = d3.time.scale()
          .domain(x_domain)
          .range([0, width - 50 - 50]);
      var y = d3.scale.linear()
          .domain([0, d3.max(stacked_categories.map(function(p){ return p.value[p.value.length-1].y1; }))]) 
          .range([height - 10 - 50, 0]);

      el.selectAll('svg').remove();
      var svg = el
          .append('svg')
          .attr('width', width)
          .attr('height', height);
      var graph = svg
          .append('g')
          .attr('transform', 'translate(50,10)');

      var bar_width = 0.9*(width - 50 - 50)/categories_by_date.all().length;

      var bar = graph.selectAll(".bar")
        .data(stacked_categories) // or x.domain() or .data(categories_by_date.all())
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d,i) { return "translate(" + x(d.key) + ",0)"; });
   

      // var focus = graph.append("g")
      //     .attr("class", "focus")
      //     .attr('transform', 'translate('+(width-50-50-100)+',0)')
      //     .style("display", "none");

      // focus.append("text")
      //     .attr("x", 9)
      //     .attr("dy", ".35em");

      var rect = bar.selectAll("rect")
        .data(function(d){ return d.value; })
        .enter().append("rect")
        .attr("width", bar_width)
        .attr('transform', function(d,i){ return 'translate(0,' + (y(d.y1)) + ')'; })
        .attr("height", function(d) { return (y(d.y0) - y(d.y1)); })
        .style("fill", function(d) { return color(d.category); }); 
        // .on("mouseover", function(d,i) { 
        //   focus.style("display", null); 
        //   focus.select("text").text(d.category+":"+d.val);
        // })
        // .on("mouseout", function() { focus.style("display", "none"); });

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

      svg.append("g")
          .attr('transform', 'translate(45,10)')
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Expenditure ($)");

      var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(interval)
        .orient("bottom");

      svg.append("g")
          .attr('transform', 'translate('+(50+bar_width/2)+','+(height-50)+')')
          .attr("class", "x axis")
          .call(xAxis)
          .selectAll('text')
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr('transform', 'rotate(-65)');

      // last_tick = svg.select('.x.axis').node();
      // xAx.node().removeChild(xAx.node().lastChild);

      function brushed() {
        var extent0 = brush.extent(),
            extent1;

        // if dragging, preserve the width of the extent
        if (d3.event.mode === "move") {
          var d0 = interval.round(extent0[0]),
              d1 = interval.round(extent0[1]);
              // d1 = interval.offset(d0, Math.round((extent0[1] - extent0[0]) / 864e5));
          extent1 = [d0, d1];
        }
        // otherwise, if resizing, round both dates
        else {
          extent1 = extent0.map(interval.round);

          // if empty when rounded, use floor & ceil instead // TODO jus use init or brush.empty() ? x.domain() : brush.extent()
          if (extent1[0] >= extent1[1]) {
            extent1[0] = interval.floor(extent0[0]);
            extent1[1] = interval.ceil(extent0[1]);
          }
        }

        d3.select(this).call(brush.extent(extent1));
        category_by_date.filterRange(extent1);
        update_average_by_category(interval.range(extent1[0],extent1[1]).length);
        update_sum_by_category();
      }


      var brush = d3.svg.brush()
          .x(x)
          .on("brush", brushed);          
      graph.append("g")
          .attr("class", "x brush")
          .call(brush)
        .selectAll("rect")
          .attr("y", -10)
          .attr("height", height + 15); 

      // initialize
      var last_date = categories_by_date.all().slice(-3)[0].key;
      var extent1 = [last_date, interval.offset(last_date,3)];
      brush.extent( extent1 );
      graph.select('.brush').call(brush);
      category_by_date.filterRange(extent1);
      update_average_by_category(interval.range(extent1[0],extent1[1]).length);
      update_sum_by_category();

    }



}