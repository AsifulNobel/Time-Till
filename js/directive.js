var storage = chrome.storage.local;

function replaceTimezone(timeStr) {
	return timeStr.replace(/\sGMT.*$/, "");
}

function clearError() {
	document.getElementById('errors').innerHTML = "";
}

function setError(errorMsg) {
	document.getElementById('errors').innerHTML = errorMsg;
}

function addZero(str) {
	return str > 9 ? str : '0'+str;
}

function formatTime(timeStr) {
	return timeStr.getFullYear()+'-'+(addZero(timeStr.getMonth()+1))+
	'-'+addZero(timeStr.getDate())+'T'+addZero(timeStr.getHours())+':'+addZero(timeStr.getMinutes())
}

// ToDo: Modularize asynchronous callback functions for storage.get,
// so that those functions call another function with result of storage call.
function restoreCountdowns(timersList, divFlag) {
	storage.get('events', function(items){
		if (typeof items.events !== "undefined") {
			var eventDict = items.events

			if (Object.keys(eventDict).length > 0 && timersList) {
				console.log(Object.keys(eventDict).length)

				if (divFlag == 0) {
					for (var key in eventDict) {
						if (eventDict.hasOwnProperty(key)) {
							timersList.insertAdjacentHTML('beforeend', 
								'<li id="'+ key + '">' + key + ': ' + replaceTimezone(eventDict[key]) + 
								' <i class="fa fa-pencil-square-o edit-ev"></i> <i class="fa fa-times delete-ev"></i>' 
								+ '</li>')
						}
					}
				}
				else if (divFlag == 1) {
					for (var key in eventDict) {

						if (eventDict.hasOwnProperty(key)) {
							timersList.insertAdjacentHTML('beforeend', 
									'<div>' + key + ': ' + replaceTimezone(eventDict[key]) + '</div>')
						}
					}
				}
			}
		}
	});
}

function saveEvent() {
	var eventTime = document.getElementsByName('timer-time');
	var eventName = document.getElementsByName('timer-name');
	var timersList = document.getElementById('timers');

	if(eventTime.length > 0 && eventName.length > 0) {
		var eventDateObj = new Date(eventTime[0].value);

		if (eventName[0].value.length > 0) {
			if (eventDateObj - Date.now() > 0) {

				storage.get('events', function(items) {
					if (typeof items.events !== "undefined") {
						var eventDict = items.events					
						
						eventDict[eventName[0].value] = eventDateObj.toUTCString()
						
						storage.set({events: eventDict}, function() {
							timersList.insertAdjacentHTML('beforeend', 
								'<li id="'+ eventName[0].value + '">' + eventName[0].value + ': ' + 
								replaceTimezone(eventDateObj.toUTCString()) + 
								'<i class="fa fa-pencil-square-o edit-ev"></i><i class="fa fa-times delete-ev"></i>' 
								+ '</li>')

							console.log("Successfully Added Event!");
						});

						clearError();
					}
				})
			}
			else {
				setError("Date must be in future.");
			}
		}
		else {
			setError("Event must have a name.");
		}
	}
}

function editEvent() {
	// Gets called from event element adjacent edit button
	var eventTime = document.getElementsByName('timer-time')[0];
	var eventName = document.getElementsByName('timer-name')[0];

	// Gets parent element which is the event entry
	var parent = this.parentElement;
	var parentText = parent.innerText.split(': ');

	eventName.value = parentText[0];
	eventTime.value = formatTime(new Date(parentText[1]));

	// passes context to deleteEvent fn
	deleteEvent.call(this);
}

function deleteEvent() {
	var parent = this.parentElement;
	var eventName = parent.innerText.split(': ')[0];
	
	storage.get('events', function(items) {
		if (typeof items.events !== "undefined") {
			var eventDict = items.events					
			
			delete eventDict[eventName];
			
			storage.set({events: eventDict}, function() {
				console.log("Successfully Deleted Event!");
			});

			clearError();
		}
	})

	parent.innerText = '';
	parent.parentElement.removeChild(parent);
}