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
	var eventDivs = document.getElementsByClassName("event-div")

	if (eventDivs.length < 0)
		return

	var eventCopy = Array.from(eventDivs)
	var eventCopyLength = eventCopy.length
	var parent = eventDivs[0].parentElement

	while(eventDivs.length > 0) {
		eventDivs[0].remove()
	}

	eventCopy.sort(compareEvent)

	for(var index = 0; index < eventCopyLength; index++) {
		parent.appendChild(eventCopy[index])
	}
}

function masterFn() {
	restoreCountdowns(document.getElementById('parent-div'), 1);
}

// waits until initial document without stylesheet and other resources is load
document.addEventListener('DOMContentLoaded', masterFn);

var fnList = [sortEvents];
var docCheckInterval = null;
// Checks if document is fully loaded every 0.5 second
docCheckInterval = setInterval(function() {
	if (document.readyState == "complete") {
		for(var i = 0; i < fnList.length; i++) {
			fnList[i]();
		}
		clearInterval(docCheckInterval);
	}
}, 50);
