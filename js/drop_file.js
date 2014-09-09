var locationTrie = {};
var categoryTrie = {};

// var raw_transactions; 


// var nested_by_category = d3.map();
// var color = d3.scale.category20();
// var unique_dates = d3.set();
// var unique_categories = d3.set();
// var unique_dates_values;


// var x = d3.scale.ordinal();

// var filtered_categories;
// var table_brush;


// // The date format
// // var interval = d3.time.month; // https://github.com/mbostock/d3/wiki/Time-Intervals
// // var interval_format = d3.time.format("%b");
// var interval = d3.time.week;
// var interval_format = d3.time.format("%d-%b-%y"); 
// var month_interval = d3.time.month;
// var month_format = d3.time.format("%b-%y");



function loadCSV(csvs){
// Date   Description   Debit   Credit  Balance

      d3.select('#headings').classed('invisible', false);
      d3.select('#drop').classed('invisible', true);


      // raw_transactions = csvs;

 
      // make locations trie then display 'categorize'
      d3.csv('data/suburbsR.csv.json', function(suburbData){

          var locations= ["nsw", "new south wales", 
                          "vic", "victoria", 
                          "qld", "queensland", 
                          "sa", "south australia", 
                          "tas", "tasmania", 
                          "wa", "western australia",
                          "act", "australian capital territory",
                          "nt", "northern territory",
                          "aus", "australia"];
                          
          locations = locations.concat(suburbData.map(function(row){return row.suburb.toLowerCase(); }));
          
          growTrie(locations, locationTrie);

          var get_all_the_data = transaction_table(csvs);

          // when they're ready, visualize

            

          d3.select('.proceed a').on('click', function(){ 
            
            d3.select(this)
              .attr('href',rowsToCSV(get_all_the_data()) )
              .attr('download', 'categorized_data.csv');
            
            visualize(get_all_the_data()); 

            // var outputFile = window.prompt("What do you want to name your output file (Note: This won't have any effect on Safari)") || 'export';
            // outputFile = outputFile.replace('.csv','') + '.csv'
             
            openTab(null,1); 
          });

      });
          
}


// for degugging purposes
d3.text('eg_transactions/NAB_CAT.csv', function(data){
d3.text('eg_transactions/NAB.csv', function(nabdata){
d3.text('eg_transactions/ING.csv', function(ingdata){
  loadCSV([{name:'NAB_CAT.csv' , content:data},
    {name: 'NAB.csv', content:nabdata},
    {name:'ING.csv' , content:ingdata}]);
});
});
});

/* set up drag-and-drop event */
var drop = document.getElementById('drop');

function handleFile(files,i){
    var csvs = [];
    var file = files[i];
    var reader = new FileReader();
    var name = file.name;
    reader.onload = function(e) {
      
      // try {
        csvs.push( {name: name, content: e.target.result} );
        if (csvs.length == files.length) {
          loadCSV( csvs );
          // openTab(null,1);
        }

      // }
      // catch(err){
      //   alert("Sorry, I can't read that CSV file");
      // }

    };
    // reader.readAsBinaryString(f);
    reader.readAsText(file);
}


function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  var files = e.dataTransfer.files;

  for (var i = 0; i != files.length; ++i) {
      handleFile(files,i); // for closure
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


// see https://gist.github.com/adilapapaya/9787842 for exporting table
// http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side

// download csv
function rowsToCSV(rows){
  var formatter = d3.time.format("%d/%b/%Y");
  var csv = [];
  var keys = Object.keys(rows[0]);
  csv[0] = keys.join(',');
  for (var i = 0; i < rows.length; i++) {
    csv[i+1] = keys.map(function(d){ 
      if (d == 'date') { rows[i][d] = formatter(rows[i][d]); }
      return rows[i][d]; 
    }).join(',');
  };
  csv = csv.join('\r\n');
  var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

  return csvData;
}
