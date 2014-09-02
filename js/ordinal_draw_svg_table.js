function draw_table(){
    
  var unique_dates_values = unique_dates.values().reverse(); // TODO SORT

  var w = document.getElementById('graph').clientWidth,
    margin = {top: 40, right: 120, bottom: 40, left: 120};

  x.rangeRoundBands([0, w - margin.left - margin.right],.1)
        .domain(unique_dates_values);
    

  // sum for each week/month
  var sums = unique_dates_values.map(function(date){
    var sum = 0;
    for (var i = 0; i < color.domain().length; i++) {
      if( val = nested_by_category.get(color.domain()[i]).get(date) ){
        sum += val.expenses;
      }
    };
    return sum;
  })

  // average for each category
  var averages = color.domain().map(function(c){
    return d3.sum(nested_by_category.get(c).values().map(function(val){
      return val.expenses;
    }))/unique_dates_values.length;
  });

  var filtered_categories = color.domain().filter(function(d,i){ return (averages[i] > 3); })
  var filtered_averages = averages.filter(function(d,i){ return (d > 3); })

  d3.select('#table svg').remove();
  var table = d3.select('#table').append("svg")
          .attr('width', w)
          .attr('height', 20*filtered_categories.length + margin.top+margin.bottom)
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
      .style('fill', function(d,i) { return color(d); })
      .attr('transform', 'translate(0,-18)')
      .attr('width',w - margin.left - margin.right)
      .attr('height', 20);

  // column shades
  table.append("g")
      .selectAll("rect")
      .data(unique_dates_values.filter(function(date,i){return i%2;}))
      .enter()
      .append("rect")
      .attr('transform', function(d,i){ return 'translate('+ x(d) +',22)'})
      .attr('width', x.rangeBand())
      .attr('height', 20*filtered_categories.length)
      .attr('fill-opacity',0.125);

    // category headings
    tbody.append('text')
      .style('font-weight', 'bold')
      .attr('font-size', '15px')
      .attr("text-anchor", "end")
      .text(function(d,i) { return d; })

    // cells
    tbody.selectAll("text.cell")
        .data(function(d,i) { 
          return nested_by_category.get(d).entries(); 
         })
        .enter()
        .append('text')
        .attr('class','cell')
        .attr('font-size', Math.min(x.rangeBand()/3,12))
        .attr('transform', function(d,i){ return 'translate('+ x(d.key) +',0)'})
        .text( function(d,i) {
            // return d.value.expenses.toFixed();
            return (d.value.expenses != 0) ? d.value.expenses.toFixed() : '';
        })

    // averages
     tbody.append('text')
         .attr('font-size', x.rangeBand()/3)
        .text(function(d,i) { return filtered_averages[i].toFixed(); })
        .attr('transform','translate('+ (w - margin.left - margin.right) +',0)')
   
    table
        .append("text")
        .attr('transform', function(d,i){ return 'translate('+ (w - margin.left - margin.right + x.rangeBand()) +',0)rotate(-60)'})
        .attr("text-anchor", "middle")
        .style('font-weight', 'bold')
        // .attr('font-size', '15px')
        .text("AVERAGE");

    // thead
    table.append("g")
        .attr('class','thead')
        .selectAll("text")
        .data(unique_dates_values)
        .enter()
        .append("text")
        // .attr('transform', function(d,i){ return 'translate('+ (x(d)+x.rangeBand()) +',0)rotate(-60)'})
        .attr('transform', function(d,i){ return 'translate('+ (x(d)) +',90)rotate(90)'})
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    // sums
    table.append("g")
        .selectAll("text")
        .data(unique_dates_values)
        .enter()
        .append("text")
        .attr('font-size', Math.min(x.rangeBand()/3,12))
        .attr('transform', function(d,i){ return 'translate('+ (x(d)) +','+(40+20*filtered_categories.length)+')'})
        // .attr("text-anchor", "middle")
        .text(function(d,i) { return sums[i].toFixed(); });

    table.append("g")
        .append("text")
        .style('font-weight', 'bold')
        .attr("text-anchor", "end")
        .attr('font-size', '15px')
        .attr('transform','translate('+0 +','+(40+20*filtered_categories.length)+')')
        // .attr("text-anchor", "middle")
        .text('TOTAL');


}