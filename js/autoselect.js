

// change sometimes
// =====================

function make_autocomplete(filterInput, resultsDiv, filterRender, chosen){
	function renderResults(results){
		// render list
		resultsDiv.html(filterRender());
		resultsDiv.find(':first').addClass('active');

		// mouse navigation listeners
		resultsDiv.children().off('mouseenter');
		resultsDiv.children().on('mouseenter',
		    function(){
		      resultsDiv.find('.active').removeClass('active');
		      $(this).addClass('active');
		    }
	  	);
	}

	var chosen_i = 0;
	filterInput.on('blur', function(){
		chosen(chosen_i);
		resultsDiv.off('click');
		resultsDiv.hide();
	});

	filterInput.off('focus');
	filterInput.on('focus', function(e){
		resultsDiv.show();
		this.setSelectionRange(0, this.value.length);
		renderResults();
	  	var current;
	  	filterInput.off('keyup');
	 	filterInput.on('keyup', function(e){
	        switch(e.keyCode){
	          case 38: // up
	            current = resultsDiv.find('.active');
	            if (!current.is(':first-child')) current.removeClass('active').prev().addClass('active');   
	            break;
	          case 40: // down
	            current = resultsDiv.find('.active');
	            if (!current.is(':last-child')) current.removeClass('active').next().addClass('active');   
	            break;
	          case 13: // enter
	          	chosen_i = resultsDiv.find('.active').attr('data-i');
	          	filterInput.trigger('blur');
	            break;
	          // case 9: // tab
	          //   break;
	          case 27: // escape
	          	filterInput.trigger('blur'); 		
	            break;
	          default:
	            renderResults( );
	        }
	  	});

	  	resultsDiv.off('mousedown'); // fires before blur, click fires after
	  	resultsDiv.on('mousedown', function(){
	  		chosen_i = resultsDiv.find('.active').attr('data-i');
	        filterInput.trigger('blur');
	  	});

	});

}

