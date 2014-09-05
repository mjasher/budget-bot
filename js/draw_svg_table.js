function draw_table(){
    
  var w = document.getElementById('graph').clientWidth,
    margin = {top: 40, right: 120, bottom: 40, left: 120};

  x.rangeRoundBands([0, w - margin.left - margin.right],.1)
        .domain(unique_dates_values);
    
  var number_format = d3.format(',.0f');

  // sum for each week/month
  var sum_map = d3.map();
  unique_dates_values.forEach(function(date){
    var sum = 0;
    for (var i = 0; i < filtered_categories.length; i++) {
      if( val = nested_by_category.get(filtered_categories[i]).get(date) ){
        sum += val.expenses;
      }
    };
    sum_map.set(date,{expenses:sum});
    return sum;
  })
  nested_by_category.set('TOTAL',sum_map);
  unique_categories.add('TOTAL');
  filtered_categories.push('TOTAL')

  // average for each category
  var averages = filtered_categories.map(function(c){
    return d3.sum(nested_by_category.get(c).values().map(function(val){
      return val.expenses;
    }))/unique_dates_values.length;
  });

  // var filtered_categories = color.domain().filter(function(d,i){ return (averages[i] > 3); })
  // var filtered_averages = averages.filter(function(d,i){ return (d > 3); })

  d3.select('#table svg').remove();
  var svg = d3.select('#table').append("svg")
          .attr('width', w)
          .attr('height', 20*filtered_categories.length + margin.top+margin.bottom);
	var table = svg
          .append('g')
          .attr('transform', 'translate('+margin.left+','+margin.top+')');

  // rows
  var tbody = table.selectAll("g.tbody")
      .data(filtered_categories)
      .enter()
      .append("g")
      .attr('class','tbody')
      .attr('transform', function(d,i){ return 'translate(0,'+ (40+i*20) +')'});

  // row colors
  tbody.append('rect')
      .attr('fill-opacity',0.125)
      .style('fill', function(d,i) { return color(d); })
      .attr('transform', 'translate(0,-18)')
      .attr('width',w - margin.left - margin.right)
      .attr('height', 20);

  // column shades
  var col_shades = table.append("g")
      .selectAll("rect")
      .data(unique_dates_values.filter(function(date,i){return i%2;}))
      .enter()
      .append("rect")
      .attr('height', 20*filtered_categories.length)
      .attr('fill-opacity',0.125);

    // cells
    var cells = tbody.selectAll("text.cell")
        .data(function(d,i) { 
          return nested_by_category.get(d).entries(); 
         })
        .enter()
        .append('text')
        .attr("text-anchor", "end")
        .attr('class','cell')
        // .style('font-size', '100%')
        .attr('font-size', Math.min(x.rangeBand()/3,12))
        // .attr('transform', function(d,i){ return 'translate('+ x(d.key) +',0)'})
        .text( function(d,i) {
            // return d.value.expenses.toFixed();
            return (d.value.expenses != 0) ? number_format(d.value.expenses) : '';
        })

  // table.append('rect')
  //     .attr('height', 20*filtered_categories.length + margin.top+margin.bottom)
  //     .attr('width', 120)
  //     .attr('transform', 'translate('+(w-margin.left-margin.right)+',0)')
  //     .style('fill','white');


    // averages
    tbody.append('rect')
        .attr('fill', 'white')
        .attr('width',120)
        .attr('height', 20)
        .attr('transform','translate('+ (w - margin.left -margin.right) +',-20)');
    tbody.append('text')
        .attr("text-anchor", "end")
         // .attr('font-size', x.rangeBand()/3)
        .text(function(d,i) { return number_format(averages[i]); })
        .attr('transform','translate('+ (w - margin.left -40) +',0)');

   
    table
        .append("text")
        .attr('transform', function(d,i){ return 'translate('+ (w - margin.left - margin.right + x.rangeBand()) +',0)rotate(-60)'})
        .attr("text-anchor", "middle")
        .style('font-weight', 'bold')
        // .attr('font-size', '15px')
        .text("AVERAGE");

    // thead
    var  thead = table.append("g")
        .attr('class','thead')
        .selectAll("text")
        .data(unique_dates_values)
        .enter()
        .append("text")
        // .attr('transform', function(d,i){ return 'translate('+ (x(d)+x.rangeBand()) +',0)rotate(-60)'})
        // .attr('transform', function(d,i){ return 'translate('+ (x(d)) +',90)rotate(90)'})
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });




    // category headings
    var headings = svg
      .append('g')
      .attr('transform', 'translate('+margin.left+','+margin.top+')')
      .selectAll("g.cats")
      .data(filtered_categories)
      .enter()
      .append("g")
      .attr('transform', function(d,i){ return 'translate(0,'+ (40+i*20) +')'});

    headings.append('rect')
      // .attr('fill-opacity',0.125)
      .style('fill', function(d,i) { return color(d); })
      .attr('transform', 'translate(-120,-18)')
      .attr('width',120)
      .attr('height', 20);

    headings
      .attr('class','cats')
      .append('text')
      .style('font-weight', 'bold')
      .attr('font-size', '15px')
      .attr("text-anchor", "end")
      .text(function(d,i) { return d; });



    // sums
    // table.append("g")
    //     .selectAll("text")
    //     .data(unique_dates_values)
    //     .enter()
    //     .append("text")
    //     .attr('font-size', Math.min(x.rangeBand()/3,12))
    //     .attr('transform', function(d,i){ return 'translate('+ (x(d)) +','+(40+20*filtered_categories.length)+')'})
    //     // .attr("text-anchor", "middle")
    //     .text(function(d,i) { return sums[i].toFixed(); });

    // table.append("g")
    //     .append("text")
    //     .style('font-weight', 'bold')
    //     .attr("text-anchor", "end")
    //     .attr('font-size', '15px')
    //     .attr('transform','translate('+0 +','+(40+20*filtered_categories.length)+')')
    //     // .attr("text-anchor", "middle")
    //     .text('TOTAL');



    table_brush = function(){
          cells.attr('transform', function(d,i){
            return 'translate('+ (x(d.key) +x.rangeBand()) +',0)';
          });

          thead.attr('transform', function(d,i){
              return 'translate('+ (x(d)+x.rangeBand()) +',0)rotate(-60)';
            });

          col_shades.attr('transform', function(d,i){ return 'translate('+ x(d) +',22)'})
              .attr('width', 10*x.rangeBand()/9);

    }

    table_brush();

}