

var nested_by_category = d3.map();
var color = d3.scale.category20();
var unique_dates = d3.set();
var unique_categories = d3.set();

var x = d3.scale.ordinal();
// var x = d3.time.scale();

var filtered_categories;
var table_brush;


// The date format
// var interval = d3.time.month; // https://github.com/mbostock/d3/wiki/Time-Intervals
// var interval_format = d3.time.format("%b");
var interval = d3.time.week;
var interval_format = d3.time.format("%d-%b-%y"); 
var month_interval = d3.time.month;
var month_format = d3.time.format("%b-%y");

var unique_dates_values;

function loadCSV(data){
    // var data = d3.csv.parse(data); 

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


// for degugging purposes
// d3.csv('DELETE_THIS.csv', function(data){
//   loadCSV(data);
// });

/* set up drag-and-drop event */
var drop = document.getElementById('drop');

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  var files = e.dataTransfer.files;
  var i,f;
  for (i = 0, f = files[i]; i != files.length; ++i) {
    var reader = new FileReader();
    var name = f.name;
    reader.onload = function(e) {
      
      try {

        loadCSV( d3.csv.parse(e.target.result) );
        openTab(null,1);

      }
      catch(err){
        alert("Sorry, I can't read that CSV file");
      }

    };
    // reader.readAsBinaryString(f);
    reader.readAsText(f);
  }
}


function handleDragover(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

if(drop.addEventListener) {
	drop.addEventListener('dragenter', handleDragover, false);
	drop.addEventListener('dragover', handleDragover, false);
	drop.addEventListener('drop', handleDrop, false);
}