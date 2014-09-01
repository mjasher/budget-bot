

var nested_by_category = d3.map();
var color = d3.scale.category20();
var unique_dates = d3.set();
var unique_categories = d3.set();

// The date format
// var interval = d3.time.month; // https://github.com/mbostock/d3/wiki/Time-Intervals
// var interval_format = d3.time.format("%b");
var interval = d3.time.week;
var interval_format = d3.time.format("%d-%b-%y"); 

function loadCSV(data){
    // var data = d3.csv.parse(data); 

      var dateFormat = d3.time.format("%d-%b-%y"); // https://github.com/mbostock/d3/wiki/Time-Formatting
      
      // TODO auto categorize , make sure we have d.date,amount,category
      for (var i = 0; i < data.length; i++) {
        try{
          data[i].date = dateFormat.parse(data[i].date);
          data[i].amount = +data[i].amount;

          if (data[i].category == '') data[i].category = '-';

          unique_dates.add( interval_format(interval(data[i].date)) ); 
          unique_categories.add( data[i].category ); 

        }
        catch(err){
          console.log("couldn't parse ", data[i].date);
        }
      };


      color.domain(unique_categories.values());

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
                // leaves: leaves

              } 
      }

      nested_by_category = d3.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return interval_format(interval(d.date)); })
        .rollup(rollup)
        .map(data, d3.map);


      draw_table();
      // draw();


}



// for degugging purposes
d3.csv('DELETE_THIS.csv', function(data){
  loadCSV(data);
});

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