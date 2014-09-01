

        // .entries(categorized);

      // for (var i = 0; i < unique_categories.values().length; i++) {
      //   var row = { category: unique_categories.values()[i] };
      //   for (var j = 0; j < nested_by_interval.entries().length; j++) {
      //     row[ nested_by_interval.entries()[j].key ] = nested_by_interval.entries()[j].value
      //                                                 .get(unique_categories.values[i])
      //                                                 .expenses;
      //   };
      //   tabled.push(row);
      // };

            // // TODO ensure intervals is sorted
      // var intervals = unique_dates.values();
      // var blank_cat

      // for (var i = 0; i < data.length; i++) {
      //   if (cat = nested_by_category.get(data[i].category) ){
      //     console.log(interval(data[i].date));
      //     var total = cat.get( interval(data[i].date).toISOString() );
      //     total.expenses +=  data[i].amount;
      //     console.log(total,data[i].amount)
      //   }
      //   else {
      //     var new_cat = d3.map();
      //     for (var j = 0; j < intervals.length; j++) {
      //       new_cat.set(intervals[j],{expenses: 0});
      //     };
      //     nested_by_category.set(data[i].category, new_cat);
      //   }
      // };