    /* 
    notes
    =====
        trunctions and inserted spaces are very common
        suburbs, states tend to be later
        numbers seem meaningless


    variables
    =========
        N: number of words/combinations
        len(n): length of word/combination
        pos(n): position of word/combination
        loc(n): is each word/combination in locations? could be extended to levenshtein (ignoring inserted/deleted space)
        cats(n,cat): number of times word/combination is mapped to each category in existing data

    method
    ======
        sum of scores for words/combinations (only longest?)
        max_cat ( sum_n ( cats(n) if len > 4, not (pos(n)/N > 1/2 and loc(n)) ) )
        we could chuck some constants and scaling factors in there and calibrate

    */


function make_phrases(description){
    // remove words with more numbers than letters
    var phrases = description.split(' ').filter(function(sub){
        var numbers = sub.replace(/[^0-9]/g,"").length;
        var nonNumbers = sub.replace(/[0-9]/g,"").length;
        return numbers < nonNumbers;
    });

    // for [w1,w2,w3] we add [w1w2w3, w2w3, w3] to a trie
    for (var i = 0; i < phrases.length; i++) {
        phrases[i] = phrases.slice(i).join('');
    };

    return phrases;
}

// teach just one row
function teach_bot(description, category){

    var phrases = make_phrases(description);
    if (category in categoryTrie) categoryTrie[category] = growTrie(phrases, categoryTrie[category]);
    else categoryTrie[category] = growTrie(phrases, {});

    // return phrases;

}

// initialize with all rows available
function create_bot(parsed, col_to_i){
    
    categoryTrie = {};

    // for each table
    for (var i = 0; i < parsed.length; i++) { 
        if (col_to_i[i]['description'] && col_to_i[i]['category']){
            // for each row
            for (var j = 0; j < parsed[i].length; j++) {
                if ( parsed[i][j][col_to_i[i]['description']] && parsed[i][j][col_to_i[i]['category']] ){
                    teach_bot(parsed[i][j][col_to_i[i]['description']], parsed[i][j][col_to_i[i]['category']]);
                }
            };
        } 
    };

}


// description to category - hopefully
function ask_bot(description){
    var threshhold = 0; // POTENTIAL VARIABLE
    var loc_penalty = 2; // POTENTIAL VARIABLE
    var min_len = 4; // POTENTIAL VARIABLE
    // TODO position and frequency

    var phrases = make_phrases(description);
    var categories = Object.keys(categoryTrie);
    var best_yet = {category: '', score: threshhold};
    for (var i = 0; i < categories.length; i++) {
        for (var j = 0; j < phrases.length; j++) {
            // for every substring
            for (var k = min_len; k < phrases[j].length; k++) {
                var word = phrases[j].slice(0,phrases[j].length-k);
                if (trieContains(categoryTrie[categories[i]], word)){
                    var score = word.length;
                    if (trieContains(locationTrie, word)) score = score/2;
                    if (score > best_yet.score) best_yet = {category: categories[i], score: score};
                }
            };
        };
    };

    return best_yet.category;
    // return description+'||'+best_yet.score+'||'+best_yet.category;

}




// trie


function growTrie(list,trie){
    // make a trie, lowercase and no spaces 
    // TODO maybe add functionality for levenshtein distance
    var word;
    for (var i = 0; i < list.length; i++) {        
        word = list[i].toLowerCase().replace(/ /g, '');
        var currentObj = trie;
        for (var j = 0; j < word.length; j++) {
            if (word.charAt(j) in currentObj) currentObj = currentObj[word.charAt(j)];
            else {
                currentObj[word.charAt(j)]={};
                currentObj = currentObj[word.charAt(j)];
            }
        }; 
    };
    return trie;
}

function trieContains(trie, word){
    currentObj = trie;
    var i = 0;
    while( word.toLowerCase().charAt(i) in currentObj ){
        currentObj = currentObj[word.toLowerCase().charAt(i)];
        i++;
    }
    if (i===word.length) return true;
    else return false;
}


// check out http://stevehanov.ca/blog/index.php?id=114 and "Fast Approximate Search in Large Dictionaries" and "Incremental Construction of Minimal Acyclic Finite-State Automata"
// succinct tree vs. DAWG http://stevehanov.ca/blog/index.php?id=120
// TODO we should use stevehanov's succinct tree, implement levenshtein automaton for that

// thanks to https://github.com/Glench/fuzzyset.js/blob/master/lib/fuzzyset.js
var levenshtein = function(str1, str2) {
    var threshhold=1, 
        notDone=true, longest=0; 
    // longest will be the longest shared begining substring differing by at most threshold

    var current = [], prev, value;
    for (var i = 0; i <= str2.length; i++){
        for (var j = 0; j <= str1.length; j++) {
            if (i && j){
                if (str1.charAt(j - 1) === str2.charAt(i - 1)){
                    value = prev;
                }
                else {
                    value = Math.min(current[j], current[j - 1], prev) + 1;
                }
            }
            else {
                value = i + j;
            }
            prev = current[j];
            current[j] = value;
        }
        // console.log(current);
        // mja
        if(notDone){
            if(Math.min.apply(Math, current) >= threshhold+1){
                longest = i-1;
                notDone = false;
            }
        }


    }
    // mja return current.pop()
    if (notDone) longest = Math.min(i,j);
    return {distance: current.pop(), longest: longest};
};


// var locationSet = {}
// for (var i = 0; i < locations.length; i++) {
//     locationSet[locations[i].toLowerCase()] = 1;
// };


// levenstein, ignoring spaces and favouring truncations
// var distance = function(str1, str2){
//     str1 = str1.replace(/ /g,'');
//     str2 = str2.replace(/ /g,'');

//     // var i = 0;
//     // while(str1[i] = str2[i]){
//     //     i++;
//     // }

//     return levenshtein(str1,str2).distance;
// }

    // TODO automatically add word if it conflicts
    // var ignore = ["limited", "ltd", "pty", "eftpos"]
        
    // for (var i = 0; i < suburbData.length; i++) {
    //     locationSet[suburbData[i].suburb.toLowerCase()] = 1;
     
    // };
