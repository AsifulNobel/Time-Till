function colorValue(colorString) {

	if (colorString == "blue") {
		return 4;
	}
	else if (colorString == "green") {
		return 3;
	} 
	else if (colorString == "yellow") {
		return 2;
	} 
	else if (colorString == "red") {
		return 1;
	}
}


function compareEvent(ev1, ev2) {
	var x = 0;
	var y = 0;

	x += colorValue(ev1.classList[1])
	y += colorValue(ev2.classList[1])

	return (x - y);
}

function sortEvents() {
	// Gets event divs created by restoreCountdowns
	var eventDivs = document.getElementsByClassName("event-div")

	if (eventDivs.length < 0)
		return

	// Deep copy event divs for modification
	var eventCopy = Array.from(eventDivs)
	var eventCopyLength = eventCopy.length
	var parent = eventDivs[0].parentElement

	while(eventDivs.length > 0) {
		eventDivs[0].remove()
	}

	// Sort divs according to color coded classes
	eventCopy.sort(compareEvent)

	// Adds divs to the DOM
	for(var index = 0; index < eventCopyLength; index++) {
		parent.appendChild(eventCopy[index])
	}
}

function masterFn() {
	// Creates divs of events in newtab page
	restoreCountdowns(document.getElementById('parent-div'), 1);

	var modal = document.getElementById('myModal');
	
	// Get the button that opens the modal
	var btn = document.getElementById("legend");

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on the button, open the modal 
	btn.onclick = function() {
	    modal.style.display = "block";
	}

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	    modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
}

// waits until initial document without stylesheet and other resources is load
document.addEventListener('DOMContentLoaded', masterFn);

// Array of functions to be called, when document is ready
var fnList = [sortEvents];

var docCheckInterval = null;
// Checks if document is fully loaded every 0.05 second
docCheckInterval = setInterval(function() {
	// Checks document state
	if (document.readyState == "complete") {
		for(var i = 0; i < fnList.length; i++) {
			fnList[i]();
		}
		// Because no need to check document state anymore
		clearInterval(docCheckInterval);
	}
}, 50);
