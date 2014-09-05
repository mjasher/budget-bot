function transaction_table(){

    var parsed = raw_transactions.map(function(csv) {
        return d3.csv.parseRows(csv.content);
    });

    var num_cols = parsed.map(function(csv) {
        return csv[0].length;
    });


    // Models
    function column_map (table_i) {
        // "\0" prevents collision with built-ins says mbostock

        this.attributes = {};
        this.id = table_i;
        this.get = function(attr){
            return this.attributes["\0"+attr];
        }
        this.has = function(attr){
            return "\0"+attr in this.attributes;
        }
        this.set = function(attr, val) {
            this.attributes["\0"+attr] = val;
            if (attr  === 'category'){
                // console.log('table', d3.select(tables[0][this.id]).selectAll('tr').selectAll('td'));
                
                // fill category values from column
                d3.select(tables[0][this.id])
                    .selectAll('tr').each(function(d,i){
                        var selection =  d3.select(this);
                        if (selection.selectAll('td')[0][val]){
                              selection.select('input').attr('value', 
                                            selection.selectAll('td')[0][val].innerHTML);
                        }
                      
                    });

                // console.log('cat set to ', val)
            }
        };

    }

    var column_maps = raw_transactions.map(function(csv,i) {
        return new column_map(i);
    });


    // it'd be nice to get rid of empty columns
    // raw_transactions.forEach(function(csv,i){
    //     var all_blank;
    //     var remove = [];
    //     for (var j = 0; j < num_cols[i].length; j++) {
    //         all_blank = true;
    //         for (var k = 0; k < csv.length; k++) {
    //             if (csv[k,j] != '') all_blank = false;
    //         };
    //         if (all_blank) {

    //             break;
    //         }
    //     };
    // });

    // function clever_cols (d, table_i) {
    //     var column_matches = {};
    //     // var re = column_names.map(function(column_name){ return new Regexp(column_name,i); })
    //     var column_selects = d.map(function(){ return column_names; });
    //     for (var i = 0; i < d.length; i++) {
    //         var word = d[i].toLowerCase().replace(/\s*/g,'');
    //         for (var j = 0; j < possible_columns.length; j++) {
    //             if (word == possible_columns[j]) {
    //                 column_maps[table_i].set(word,j);
    //                 column_selects[i] = column_selects[i].replace( 'value="'+word+'"', 'selected="selected" ' + 'value="'+word+'"' );
    //             }
    //         };
    //     };
    //     return column_selects;
    // }



    var possible_columns = ['date','description', 'amount', 'debit', 'credit', 'category'];

    var column_names = '<select> <option value="blank"></option> ' 
                    + possible_columns.map(function(d){ return '<option value="'+d+'">'+d+'</option>'; }).join(' ')
                    +' </select>';


    // ======================
    // draw table
    // ======================

    var transactions = d3.select("#transactions");

    var tableNavs = transactions
        .append('p')
        .selectAll('.csvNav')
        .data(raw_transactions.map(function(d){ return d.name; }))
        .enter()
        .append('span')
        .attr('class', function(d,i){ 
            return i === 0 ?  'csvNav title active' : 'csvNav title';
        })
        .html(function(d){ return d; })
        .on('click', function(d,i){
            tables.classed('invisible', function(d,j){  return i !== j; });
            tableNavs.classed('active', function(d,j){  return i === j; });
        });

    var tables = transactions
        .selectAll('.csv')
        .data(parsed)
        .enter()
        .append('table')
        .attr('class', function(d,i){ 
            return i === 0 ?  'csv' : 'csv invisible';
        });

    // pick headers
    var thead = tables
        .append('tr')
        .attr('class', "column-names");

    // append a cell to each row for each column
    tables
        .selectAll("tr.row")
        .data(function(d,i){ return d; })
        .enter()
        .append("tr")
        .attr('class', 'row')
        .selectAll("td")
        .data(function(row,i) { return row.concat(['<input type="text" class="category">']); })
        .enter()
        .append('td')
        .html( function(d) { return d; });  

// console.log('table done')

     thead
        .selectAll(".column-name")
        .data(function(d,i) { 
            // var cols = clever_cols(d[0],i);
            var cols = d[0].map(function(){ return column_names; })
            return cols.concat(['category']); // first row 
        })
        .enter()
        .append('td')
        .attr('class', "column-name")
        .html(function(d) { return d; });


    // ======================
    // auto categorization 
    // ======================


    // listeners 
    tables.each(function(d,i){
        d3.select(this).selectAll('select')
            .on('change', function(dd,j){
                // console.log('j',j)
                column_maps[i].set(d3.select(this).node().value,j);
                teach_bot(i);
                for (var k = 0; k < tables.length; k++) {
                    try_recategorize(k);
                };
            });

        d3.select(this).selectAll('input.category')
            .on('change', function(dd,j){
                // console.log('asdf',column_maps)
                // console.log('d',0,'i',i,'dd',dd,'j',j,'val', d3.select(this).node().value);
                teach_bot(i);
                for (var k = 0; k < tables.length; k++) {
                    try_recategorize(k);
                };
        });
        
    });


    // try find which column is which
    tables.each(function(d,i){
        d3.select(this).selectAll(".column-name select").each(function(dd,j){
            for (var k = 0; k < possible_columns.length; k++) {
                if (d[0][j].toLowerCase().replace(/\s*/g,'') == possible_columns[k]){
                    d3.select(this).property('value', possible_columns[k]);
                    column_maps[i].set(possible_columns[k],j);
                }  
            };
        });   
    });







    // junk=tables;

    for (var i = 0; i < tables.length; i++) {
        teach_bot(i);
    };
    for (var i = 0; i < tables.length; i++) {
        try_recategorize(i);
    };

    function try_recategorize (table_i) {       

        for (var i = 0; i < parsed.length; i++) {

                    // parsed[i]
        };


    }

    function teach_bot (table_i) {
        // must have "description" and "category"
    }

    // junk = tables;
    // try and be cleaver



}
