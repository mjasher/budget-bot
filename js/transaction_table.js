function transaction_table(){
// data = csv, column_map
// listener = change col -> update map + render csv, change cat -> update csv + (render csv - done auto)
// when rendering we take csv and try to 
// view = render csv

    // ======================
    // Data
    // ======================
  
    var parsed = raw_transactions.map(function(csv) {
        return d3.csv.parseRows(csv.content);
    });
    // junk = parsed;

    var col_to_i = parsed.map(function(d){ return {}; });
    var i_to_col = parsed.map(function(d){ return {}; });

    var possible_columns = ['date','description', 'amount', 'debit', 'credit', 'category'];

    // ======================
    // preprocessing
    // ======================

    for (var i = 0; i < parsed.length; i++) {
        
        // add blank column for category in case their isn't one
        for (var j = 0; j < parsed[i].length; j++) {
            parsed[i][j].push('');
        };

        // check to see if first row contains titles
        var found = 0;
        for (var j = 0; j < parsed[i][0].length; j++) {
            for (var k = 0; k < possible_columns.length; k++) {
                if ( parsed[i][0][j].toLowerCase().replace(/\s*/g,'') == possible_columns[k] ){
                    col_to_i[i][possible_columns[k]] = j;
                    i_to_col[i][j] = possible_columns[k];
                    found += 1;
                }
            };
        };
        if ( found > 1 ) parsed[i] = parsed[i].slice(1);

    };

    // ======================
    // draw table
    // ======================

    function column_names(selected) {
            var str = '<select> <option value="blank"></option> ' 
                    + possible_columns.map(function(d){ 
                            if (selected === d) return '<option selected="selected" value="'+d+'">'+d+'</option>';
                            else return '<option value="'+d+'">'+d+'</option>'; 
                        }).join(' ')
                    +' </select>';
            return str;
    }

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

    render();
    // TODO render table only when selected
    function render(){

        tables.selectAll('tr').remove();
            
        // append a cell to each row for each column
        tables.each(function(table_d, table_i){

            // heading
            var headings = d3.select(this)
                .append('tr')
                .attr('class', "column-names") 
                .selectAll(".column-name")
                .data(function(d,i) { 
                    return d[0].map(function(e,j){ return column_names(i_to_col[table_i][j]); });
                })
                .enter()
                .append('td')
                .attr('class', "column-name")
                .html(function(d) { return d; });

            // rows
            var rows = d3.select(this)            
                .selectAll("tr.row")
                .data(function(d,i){ return d; })
                .enter()
                .append("tr")
                .attr('class', 'row');

            // cells
            rows.selectAll("td")
                .data(function(d,i) { return d; })
                .enter()
                .append('td')
                .html( function(d,i) { 
                    // if (i === col_to_i[table_i]['category']){
                    if ('category' === i_to_col[table_i][i]){
                        // return '<input type="text" class="category">';
                        // console.log('render bender', d)
                        return '<input type="text" value="'+d+'" class="category">';
                    } 
                    else return d;
                }); 
        

            // listeners

            headings.select('select')
                .on('change', function(d,i){
                    delete col_to_i[table_i][d3.select(this).node().value]; // probably unneccessary 
                    delete i_to_col[table_i][i]; // probably unneccessary 
                    col_to_i[table_i][d3.select(this).node().value] = i;
                    i_to_col[table_i][i] = d3.select(this).node().value;

                    create_bot(parsed, col_to_i);
                    render();
                    try_categorize();
                });

            // rows.select('input.category')
            //     .on('change', function(d,i){
            //         parsed[table_i][i][col_to_i[table_i]['category']] = d3.select(this).node().value; // no need to re render
            //         // console.log('d',d,'i',i,'col_to_i',col_to_i,'val', d3.select(this).node().value);
            //         if (col_to_i[table_i]['description']){
            //             if (parsed[table_i][i][col_to_i[table_i]['description']]){
            //                 teach_bot(parsed[table_i][i][col_to_i[table_i]['description']], parsed[table_i][i][col_to_i[table_i]['category']]);
            //                 try_categorize();
            //             }
            //         } 
            // }); 


        });

    }


    // ======================
    // auto categorization 
    // ======================

    create_bot(parsed, col_to_i);

    function try_categorize(){
        transactions
        .selectAll('.csv').each(function(table_d, table_j){
            d3.select(this) 
                .selectAll("tr.row")           
                .select("input.category").property('value', function(d,i){
                    var current = d3.select(this).property('value');
                    var category = d[col_to_i[table_j]['category']]; // parsed[table_j][i] OR d
                    var description = d[col_to_i[table_j]['description']]; // could be undefined
                    // TODO for some reason current doesn't always equal category
                    if (! current) { // if table has category column and row has no category
                        // var new_category = description ? ask_bot(description) : '';
                        if (description) {
                            console.log('asking',description);
                            var new_category = ask_bot(description);
                            d[col_to_i[table_j]['category']] = new_category; // parsed[table_j][i] or d
                            return new_category;
                        }
 
                    }
                    // return category ? category : '';
                    return current;
                });
        });

    }



}
