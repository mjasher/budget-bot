if(typeof require !== 'undefined') XLS = require('xlsjs');

fs = require('fs');

// staight out of XLSX.js, for sheet_to_array
function safe_decode_range(range) {
	var o = {s:{c:0,r:0},e:{c:0,r:0}};
	var idx = 0, i = 0, cc = 0;
	var len = range.length;
	for(idx = 0; i < len; ++i) {
		if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) break;
		idx = 26*idx + cc;
	}
	o.s.c = --idx;
	for(idx = 0; i < len; ++i) {
		if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) break;
		idx = 10*idx + cc;
	}
	o.s.r = --idx;
	if(i === len || range.charCodeAt(++i) === 58) { o.e.c=o.s.c; o.e.r=o.s.r; return o; }
	for(idx = 0; i != len; ++i) {
		if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) break;
		idx = 26*idx + cc;
	}
	o.e.c = --idx;
	for(idx = 0; i != len; ++i) {
		if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) break;
		idx = 10*idx + cc;
	}
	o.e.r = --idx;
	return o;
}

// slightly altered sheet_to_csv
function sheet_to_array(sheet, opts) {
	var outA = [];
	var out = "", txt = "", qreg = /"/g;
	var o = opts == null ? {} : opts;
	if(sheet == null || sheet["!ref"] == null) return "";
	var r = safe_decode_range(sheet["!ref"]);
	var FS = o.FS !== undefined ? o.FS : ",", fs = FS.charCodeAt(0);
	var RS = o.RS !== undefined ? o.RS : "\n", rs = RS.charCodeAt(0);
	var row = "", rr = "", cols = [];
	var i = 0, cc = 0, val;
	var R = 0, C = 0;
	for(C = r.s.c; C <= r.e.c; ++C) cols[C] = XLS.utils.encode_col(C);
	for(R = r.s.r; R <= r.e.r; ++R) {
		// row = "";
		rowA = [];
		rr = XLS.utils.encode_row(R);
		for(C = r.s.c; C <= r.e.c; ++C) {
			val = sheet[cols[C] + rr];
			txt = val !== undefined ? ''+XLS.utils.format_cell(val) : "";
			for(i = 0, cc = 0; i !== txt.length; ++i) if((cc = txt.charCodeAt(i)) === fs || cc === rs || cc === 34) {
				txt = "\"" + txt.replace(qreg, '""') + "\""; break; }
			// row += (C === r.s.c ? "" : FS) + txt;
			rowA.push( (C === r.s.c ? "" : '') + txt );

		}
		// out += row + RS;
		outA.push(rowA);
	}
	return outA;
}


var hse = [];

var path = '/home/mikey/ABS/HSE/';
var wb = XLS.readFile(path+'65300do001_200910.xls');
var headers;
for (var i = 0; i < wb.SheetNames.length; i++) {
	var sheet = wb.Sheets[wb.SheetNames[i]];
	// console.log(sheet);
	if (i === 29){
		var fresh = {};
	  	var rows = sheet_to_array(sheet);
	  	fresh.name = rows[3][0].replace(/"/g,'').replace(/Table [0-9]* /, '');
		for (var r = 0; r < rows.length; r++) {
	  		if ( rows[r][0] == 'AVERAGE WEEKLY EXPENDITURE'){

  				fresh.headers = rows[r-2];
  				fresh[rows[r][0]] = rows.slice(r+2,r+15).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				// fresh[rows[r+17][0]] = rows.slice(r+18,r+21).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				fresh[rows[r+15][0]] = rows.slice(r+18,r+30).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				break;
	  		}
	  		// for (var c = 0; c < rows[r].length; c++) {
	  		// 	if (rows[r][c] == 'AVERAGE WEEKLY EXPENDITURE'){

	  		// 	}
	  		// }
	  	}
	  	hse.push(fresh);
	}
	else if (i%2 == 1) {
		var fresh = {};
	  	var rows = sheet_to_array(sheet);
	  	fresh.name = rows[3][0].replace(/"/g,'').replace(/Table [0-9]* /, '');
		for (var r = 0; r < rows.length; r++) {

	  		if ( rows[r][0] == 'AVERAGE WEEKLY EXPENDITURE'){
  				fresh.headers = rows[r-2];
  				fresh[rows[r][0]] = rows.slice(r+3,r+17).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				fresh[rows[r+17][0]] = rows.slice(r+18,r+21).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				fresh[rows[r+21][0]] = rows.slice(r+24,r+38).map(function(row){ return row.map(function(d){ return d.replace(/"/g,''); }); });
  				break;
	  		}
	  		// for (var c = 0; c < rows[r].length; c++) {
	  		// 	if (rows[r][c] == 'AVERAGE WEEKLY EXPENDITURE'){

	  		// 	}
	  		// }
	  	}
	  	hse.push(fresh);
	}

}
// console.log(JSON.stringify(hse));

// var fd = fs.open(path+'hse.json', 'w');
// fs.write(fd, JSON.stringify(hse));
fs.writeFile (path+'hse.json', JSON.stringify(hse), function(err) {
        if (err) throw err;
        console.log('complete');
});