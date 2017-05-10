var storage = chrome.storage.local;

function replaceTimezone(timeStr) {
	return timeStr.replace(/\sGMT.*$/, "");
}

function formatHuman(timeStr) {
	// Replaces SECONDS part of hh:mm:ss formatted time string
	var hourPart = timeStr.slice(17, 19)

	if (hourPart == 0) {
		return timeStr.slice(0, 17) + '12' + timeStr.slice(19, 22) + " AM"
	}
	else if (hourPart >= 12) {
		return timeStr.slice(0, 17) + (hourPart - 12) + timeStr.slice(19, 22) + " PM"
	}
	else {
		return timeStr.slice(0, 17) + hourPart + timeStr.slice(19, 22) + " AM"
	}
}

function getOffsetDate(timeStr) {
	if ((new Date()).getTimezoneOffset() < 0)
		return (new Date(new Date(timeStr) - ((new Date()).getTimezoneOffset() * 60 * 1000)))
	else
		return (new Date(new Date(timeStr) + ((new Date()).getTimezoneOffset() * 60 * 1000)))
}

function clearError() {
	// Remove error meessage in options menu
	document.getElementById('errors').innerHTML = "";
}

function setError(errorMsg) {
	// Set error message in options menu
	document.getElementById('errors').innerHTML = errorMsg;
}

function addZero(str) {
	return str > 9 ? str : '0'+str;
}

function formatTime(timeStr) {
	// Convert time string to JS notation DateThh:mm:ss
	return timeStr.getFullYear()+'-'+(addZero(timeStr.getMonth()+1))+
	'-'+addZero(timeStr.getDate())+'T'+addZero(timeStr.getHours())+':'+addZero(timeStr.getMinutes())
}

function timeUpdate(milliseconds, className) {
	// Update timer after 60 seconds
	setInterval(function() {
		var timerDiv = document.getElementsByClassName(className)
		timerDiv[0].innerHTML = formatCountdown(milliseconds)
		milliseconds -= 60*1000

	}, 60000)
}

function getColorCode(timerCount, totalTime) {
	var colorCode = '';
	var percentLeft = (timerCount/totalTime) * 100;

	if (percentLeft <= 10)
		colorCode = 'red';
	else if (percentLeft <= 30)
		colorCode = 'yellow';
	else if (percentLeft <= 60)
		colorCode = 'green';
	else if (percentLeft <= 100)
		colorCode = 'blue';

	return colorCode
}

function formatCountdown (milliseconds) {
	// Formats milliseconds to Timer format
	
    function numberEnding (number) {
    	// Checks if there should be trailing s, when year, month etc is more than 1
        return (number > 1) ? 's</span>' : '</span>';
    }

    var countdownStr = '';

    if (milliseconds <= 1000) {
    	countdownStr += 'Time Up!';
    }
    else if (milliseconds > 1000 && milliseconds <= 60*1000)
    	countdownStr += 'Less than a minute';
    else {
    	var temp = Math.floor(milliseconds / 1000);
    	var years = Math.floor(temp / 31536000);
    	countdownStr += years ? years + '<span>year' + numberEnding(years) : '';
    
    	//TODO: Months!
    	var days = Math.floor((temp %= 31536000) / 86400);
    	countdownStr += days ? days + '<span>day' + numberEnding(days) : '';

    	var hours = Math.floor((temp %= 86400) / 3600);
    	countdownStr += hours ? hours + '<span>hour' + numberEnding(hours) : '';

    	var minutes = Math.floor((temp %= 3600) / 60);
    	countdownStr += minutes ? minutes + '<span>minute' + numberEnding(minutes) : '';
    }
    
    return countdownStr;
}

function restoreCountdowns(timersList, divFlag) {
	// Gets Event from local storage and shows timers in newtab page

	storage.get('events', function(items){
		if (typeof items.events !== "undefined") {
			var eventDict = items.events

			if (Object.keys(eventDict).length > 0 && timersList) {
				if (divFlag == 0) {
					for (var key in eventDict) {
						if (eventDict.hasOwnProperty(key)) {
							var temp = getOffsetDate(eventDict[key][0]);
							var temp2 = getOffsetDate(eventDict[key][1]);
							
							timersList.insertAdjacentHTML('beforeend', 
								'<li id="'+ key + '">' + '<span class="id">' + key + ':</span>' + formatHuman(replaceTimezone(temp2.toUTCString())) + 
								' - ' + formatHuman(replaceTimezone(temp.toUTCString())) + 
								'<br/><i class="fa fa-pencil-square-o edit-ev"></i> <i class="fa fa-times delete-ev"></i>'
								+ '</li>')
						}
					}
				}
				else if (divFlag == 1) {
					for (var key in eventDict) {
						// offset is not used here, because a time interval remains same
						// with or without offset
						if (eventDict.hasOwnProperty(key)) {
							var now = new Date()
							var timerCount = new Date(eventDict[key][0]) - now
							var elapsedTime = now - new Date(eventDict[key][1])

							var timerColor = getColorCode(timerCount, timerCount + elapsedTime)

							timeUpdate(timerCount, key.replace(' ', '-')+'-timer')
							timerCount = formatCountdown(timerCount)

							timersList.insertAdjacentHTML('beforeend', 
									'<div class="event-div ' + timerColor + '"><div class="' + key.replace(' ', '-') +'-name event-name">' + key + 
									'</div><div class="' + key.replace(' ', '-') +'-timer event-timer">' + timerCount + '</div></div>')
						}
					}
				}
			}
		}
	});
}

function saveEvent() {
	// Gets input from input fields, checks input.
	// If valid input, then saves event in local storage.
	// Otherwise, error message is shown.

	var eventTime = document.getElementsByName('timer-time');
	var eventStart = document.getElementsByName('timer-start');
	var eventName = document.getElementsByName('timer-name');
	var timersList = document.getElementById('timers');

	if(eventTime.length > 0 && eventName.length > 0) {
		var eventDateObj = new Date(eventTime[0].value);
		var startDate = new Date(eventStart[0].value);
		var regex = /^([0-9a-z_ ]+)$/ig;

		if (eventName[0].value.length > 0 && regex.test(eventName[0].value)) {
			if (eventDateObj - Date.now() > 0) {

				storage.get('events', function(items) {
					if (typeof items.events !== "undefined") {
						var eventDict = items.events					
						
						if (eventDict[eventName[0].value])
							eventDict[eventName[0].value][0] = eventDateObj.toUTCString()
						else
							eventDict[eventName[0].value] = [eventDateObj.toUTCString(), startDate.toUTCString()]
						
						storage.set({events: eventDict}, function() {
							timersList.insertAdjacentHTML('beforeend', 
								'<li id="'+ eventName[0].value + '">' + eventName[0].value + ': ' + 
								replaceTimezone(eventDateObj.toUTCString()) + 
								'<i class="fa fa-pencil-square-o edit-ev"></i><i class="fa fa-times delete-ev"></i>' 
								+ '</li>')

							console.log("Successfully Added Event!");
						});

						clearError();
						updateEvent();
						window.location.reload();
					}
				})
			}
			else {
				setError("Date must be in future.");
			}
		}
		else {
			setError("Event must have a valid name.");
		}
	}
}

function editEvent() {
	// Puts event info in input field and deletes the event
	
	// Gets called from event element adjacent edit button
	var eventTime = document.getElementsByName('timer-time')[0];
	var eventStart = document.getElementsByName('timer-start')[0];
	var eventName = document.getElementsByName('timer-name')[0];

	// Gets parent element which is the event entry
	var parent = this.parentElement;
	var parentText = parent.innerText.split(':');
	var startEndTime = parentText.slice(1,).join(':').trim()

	eventName.value = parentText[0];
	eventStart.value = formatTime(new Date((startEndTime.split('-')[0]).trim()));
	eventTime.value = formatTime(new Date((startEndTime.split('-')[1]).trim()));
	
	// passes context to deleteEvent fn
	deleteEvent.call(this);
}

function deleteEvent() {
	var parent = this.parentElement;
	var eventName = parent.innerText.split(':')[0];
	
	storage.get('events', function(items) {
		if (typeof items.events !== "undefined") {
			var eventDict = items.events
			
			delete eventDict[eventName];
			
			storage.set({events: eventDict}, function() {
				console.log("Successfully Deleted Event!");
			});

			clearError();
			updateEvent();
		}
	})

	parent.innerText = '';
	parent.parentElement.removeChild(parent);
}

function updateEvent() {
	// When Events are added, updated or deleted on options page,
	// 'New Tab' page also refreshes
	chrome.tabs.query({url: 'chrome://newtab/'},function(tabs){
    	tabs.forEach(function(tab){
      		chrome.tabs.reload(tab.id);
    	});
 	});
}