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

function timeUpdate(milliseconds, className) {
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

	console.log(percentLeft)
	return colorCode
}

function formatCountdown (milliseconds) {
	// Formats milliseconds to Timer format
	
    function numberEnding (number) {
    	// Checks if there should be trailing s, when year, month etc is more than 1
        return (number > 1) ? 's ' : ' ';
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
    	countdownStr += years ? years + ' year' + numberEnding(years) : '';
    
    	//TODO: Months!
    	var days = Math.floor((temp %= 31536000) / 86400);
    	countdownStr += days ? days + ' day' + numberEnding(days) : '';

    	var hours = Math.floor((temp %= 86400) / 3600);
    	countdownStr += hours ? hours + ' hour' + numberEnding(hours) : '';

    	var minutes = Math.floor((temp %= 3600) / 60);
    	countdownStr += minutes ? minutes + ' minute' + numberEnding(minutes) : '';
    }
    
    return countdownStr;
}

// ToDo: Modularize asynchronous callback functions for storage.get,
// so that those functions call another function with result of storage call.
function restoreCountdowns(timersList, divFlag) {
	storage.get('events', function(items){
		if (typeof items.events !== "undefined") {
			var eventDict = items.events

			if (Object.keys(eventDict).length > 0 && timersList) {
				if (divFlag == 0) {
					for (var key in eventDict) {
						if (eventDict.hasOwnProperty(key)) {
							// Added in case reloading takes too much time
							timersList.insertAdjacentHTML('beforeend', 
								'<li id="'+ key + '">' + key + ': ' + replaceTimezone(eventDict[key][1]) + 
								' - ' + replaceTimezone(eventDict[key][0]) + 
								' <i class="fa fa-pencil-square-o edit-ev"></i> <i class="fa fa-times delete-ev"></i>'
								+ '</li>')
						}
					}
				}
				else if (divFlag == 1) {
					for (var key in eventDict) {
						// offset is used for removing GMT offset error, since local time is saved as GMT time
						if (eventDict.hasOwnProperty(key)) {
							var timerCount = new Date(eventDict[key][0]) - Date.now() + ((new Date()).getTimezoneOffset() * 60 * 1000)
							var elapsedTime = Date.now() - new Date(eventDict[key][1])

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
	// Gets called from event element adjacent edit button
	var eventTime = document.getElementsByName('timer-time')[0];
	var eventStart = document.getElementsByName('timer-start')[0];
	var eventName = document.getElementsByName('timer-name')[0];

	// Gets parent element which is the event entry
	var parent = this.parentElement;
	var parentText = parent.innerText.split(': ');

	eventName.value = parentText[0];
	eventTime.value = formatTime(new Date((parentText[1].split(' - '))[1]));
	eventStart.value = formatTime(new Date((parentText[1].split(' - '))[0]));

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