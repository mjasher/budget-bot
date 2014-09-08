function visualize(parsed){
	
	var all_the_data;

	  // for (var i = 0; i < parsed.length; i++) {
	  // 	parsed[i]
	  // };


      var data = d3.csv.parse(csvs[0].content);
      var dateFormat = d3.time.format("%d-%b-%y"); // https://github.com/mbostock/d3/wiki/Time-Formatting
      
      // TODO auto categorize , make sure we have d.date,amount,category
      for (var i = 0; i < data.length; i++) {
        try{
          data[i].date = dateFormat.parse(data[i].date);
          data[i].amount = +data[i].amount;

          if (data[i].category == '') data[i].category = 'blank';

          // data[i].week = interval_format(interval(data[i].date));
          data[i].week = interval(data[i].date);
          // data[i].month = month_format(month_interval(data[i].date))
          data[i].month = month_interval(data[i].date);

          unique_dates.add( interval_format(interval(data[i].date)) ); 
          unique_categories.add( data[i].category ); 

        }
        catch(err){
          console.log("couldn't parse ", data[i].date);
        }
      };

      unique_dates_values = unique_dates.values().reverse(); // TODO SORT
      color.domain(unique_categories.values());

      var excluded_categories = d3.set();
      excluded_categories.add('transfer');
      excluded_categories.add('work');
      excluded_categories.add('salary');
      excluded_categories.add('parents');
      excluded_categories.add('business');

      // TODO filter out non expenses

      filtered_categories = color.domain().filter(function(cat){ return ! excluded_categories.has(cat); });


      function rollup(leaves){ 
        return {length: leaves.length, 
                income: d3.sum(leaves, 
                                  function(d) {
                                      if (d.amount > 0) return d.amount;
                                      else return 0;
                                  }),
                expenses: d3.sum(leaves, 
                                  function(d) {
                                      if (d.amount < 0) return -1*d.amount;
                                      else return 0;
                                  }),
                transactions: leaves

              } 
      }

      nested_by_category = d3.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return interval_format(interval(d.date)); })
        .rollup(rollup)
        .map(data, d3.map);

      draw_table();
      draw_bars();
}