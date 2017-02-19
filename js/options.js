function masterFn() {
	restoreCountdowns(document.getElementById('timers'), 0);
	document.getElementById('add-button').addEventListener('click', saveEvent);
}

function buttonEventAdder() {
	var editButtons = document.getElementsByClassName('edit-ev');
	var deleteButtons = document.getElementsByClassName('delete-ev');
	
	for(var i=0; i < editButtons.length; i++) {
		editButtons[i].addEventListener('click', editEvent);
		
		// Always will be same number of delete & edit buttons
		deleteButtons[i].addEventListener('click', deleteEvent); 
	}
}

var fnList = [buttonEventAdder];
var docCheckInterval = null
// Checks if document is fully loaded every 0.5 second
docCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		for(var i = 0; i < fnList.length; i++) {
			fnList[i]();
		}
		clearInterval(docCheckInterval);
	}
}, 500);

// waits until initial document with stylesheet and other resources is loaded
document.addEventListener('DOMContentLoaded', masterFn);