var col_to_i; // TODO if this is local things go wrong, get better at classes

function transaction_table(raw_transactions){

    // ======================
    // Data
    // ======================
  
    var parsed = raw_transactions.map(function(csv) {
        return d3.csv.parseRows(csv.content);
    });

    col_to_i = parsed.map(function(d){ return {}; });
    var i_to_col = parsed.map(function(d){ return {}; });

    var possible_columns = ['date','description', 'amount', 'debit', 'credit', 'category'];

    // ======================
    // preprocessing
    // ======================

    var confirmed_i;
    for (var i = 0; i < parsed.length; i++) {
        
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

        for (var j = 0; j < parsed[i].length; j++) {
            // add blank column for category in case their isn't one
            parsed[i][j].push('');

            // add 'confirmed' column, confirm if categorized already
            if (parsed[i][j][col_to_i[i]['category']]) confirmed_i = parsed[i][j].push(true);
            else confirmed_i = parsed[i][j].push(null);
        };
        col_to_i[i]['confirmed'] = confirmed_i-1;
        i_to_col[i][confirmed_i-1] = 'confirmed';    

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
                    return d[0].map(function(e,j){ 
                        if (i_to_col[table_i][j] == 'confirmed') return 'confirmed';
                        return column_names(i_to_col[table_i][j]); 
                    });
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
                        return '<input type="text" value="'+d+'" class="category">';
                    } 
                    else if ('confirmed' === i_to_col[table_i][i]){
                        return '<div class="'+d+'">'+(d ? '&#x2713;' : '&#x2717;')+'</div>'; 
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

                    if (d3.select(this).node().value == 'category'){
                        for (var j = 0; j < parsed[table_i].length; j++) {
                            // confirm if categorized already
                            if (parsed[table_i][j][col_to_i[table_i]['category']]) parsed[table_i][j][col_to_i[table_i]['confirmed']] = true;
                            else parsed[table_i][j][col_to_i[table_i]['confirmed']] = false;
                        }
                    }

                    create_bot(parsed, col_to_i);
                    render();
                    try_categorize();
                });

            rows.select('input.category')
                .on('blur', function(d,i){
                    parsed[table_i][i][col_to_i[table_i]['category']] = d3.select(this).node().value; // no need to re render
                    parsed[table_i][i][col_to_i[table_i]['confirmed']] = true;
                    this.parentNode.parentNode.lastChild.innerHTML = '<div class="true">&#x2713;</div>' // last column is 'confirmed', sick DOM skills

                    // console.log('d',d,'i',i,'col_to_i',col_to_i,'val', d3.select(this).node().value);
                    if (col_to_i[table_i]['description'] != undefined){
                        if (parsed[table_i][i][col_to_i[table_i]['description']]){
                            teach_bot(parsed[table_i][i][col_to_i[table_i]['description']], parsed[table_i][i][col_to_i[table_i]['category']]);
                            try_categorize();
                        }
                    } 
            }); 


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


    // ======================
    // extract data 
    // ======================

    return function(){
        var all_the_data = [];

        for (var i = 0; i < parsed.length; i++) {

            // amount
            if (col_to_i[i]['amount'] != undefined){
                var credit = function(row){ 
                    if (+row[col_to_i[i]['amount']] > 0) return +row[col_to_i[i]['amount']]; 
                    else return 0;
                }                
                var debit = function(row){ 
                    if (+row[col_to_i[i]['amount']] < 0) return -1 * +row[col_to_i[i]['amount']]; 
                    else return 0;
                }
            } 
            else if (col_to_i[i]['debit'] && col_to_i[i]['credit']){
                 var credit = function(row){ return +row[col_to_i[i]['credit']]; }
                 var debit = function(row){ return -1 * +row[col_to_i[i]['debit']]; }
            }
            else {
                console.log('table ', i, 'missed, no amount or credit and debit');
                continue;
            }

            // https://github.com/mbostock/d3/wiki/Time-Formatting#format            
            if (col_to_i[i]['date'] != undefined) {
                var potential_formats =["%m/%d/%y", "%d/%m/%y", "%m/%e/%y", "%e/%m/%y", "%m/%d/%Y", "%d/%m/%Y", "%m/%e/%Y", "%e/%m/%Y", "%m-%d-%y", "%d-%m-%y", "%m-%e-%y", "%e-%m-%y", "%m-%d-%Y", "%d-%m-%Y", "%m-%e-%Y", "%e-%m-%Y", "%b-%d-%y", "%d-%b-%y", "%b-%e-%y", "%e-%b-%y", "%b-%d-%Y", "%d-%b-%Y", "%b-%e-%Y", "%e-%b-%Y", "%b %d %y", "%d %b %y", "%b %e %y", "%e %b %y", "%b %d %Y", "%d %b %Y", "%b %e %Y", "%e %b %Y", "%B-%d-%y", "%d-%B-%y", "%B-%e-%y", "%e-%B-%y", "%B-%d-%Y", "%d-%B-%Y", "%B-%e-%Y", "%e-%B-%Y", "%B %d %y", "%d %B %y", "%B %e %y", "%e %B %y", "%B %d %Y", "%d %B %Y", "%B %e %Y", "%e %B %Y"] 
                    .filter(function(d){
                        var potential_parse = d3.time.format(d).parse;
                        for (var j = 0; j < parsed[i].length; j++) {
                            if (potential_parse(parsed[i][j][col_to_i[i]['date']]) == null) return false;
                        }
                        return true;
                    });
                if (potential_formats.length > 0){
                    var parser = d3.time.format(potential_formats[0]).parse;
                    var date = function(row){ return parser(row[col_to_i[i]['date']]); }
                } 
                else{ 
                    console.log('table ', i, 'missed, no date format');
                    continue;
                }   
            }
            else{ 
                console.log('table ', i, 'missed, no date');
                continue;
            }

            if (col_to_i[i]['category'] == undefined){
                console.log('table ', i, 'missed, category');
                continue;  
            }

            if (col_to_i[i]['description'] != undefined){
                // console.log('table ', i, 'missed, description');
                var description = function(row){ return row[col_to_i[i]['description']]; }  
            }
            else{
                var description = function(row){ return ''; } 
            }


            for (var j = 0; j < parsed[i].length; j++) {

                all_the_data.push({
                    date: date(parsed[i][j]),
                    debit: debit(parsed[i][j]),
                    credit: credit(parsed[i][j]),
                    description: description(parsed[i][j]),
                    category: parsed[i][j][col_to_i[i]['category']],
                });
            };
        };

        return all_the_data;

    }


}

 
