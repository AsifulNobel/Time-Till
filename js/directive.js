var storage = chrome.storage.local;

function countApp() {	
	this.eventDict = {};
	this.restoreCountdowns = restoreCountdowns;
	this.saveEvents = saveEvents.bind(this);	// For passing object context to callback
}

function replaceTimezone(timeStr) {
	return timeStr.replace(/\sGMT.*$/, "");
}

function clearError() {
	document.getElementById('errors').innerHTML = "";
}

function setError(errorMsg) {
	document.getElementById('errors').innerHTML = errorMsg;
}

function restoreCountdowns(timersList, divFlag) {

	storage.get('events', function(items){
		if (typeof items.events !== "undefined") {
			this.eventDict = items.events

			if (Object.keys(this.eventDict).length > 0 && timersList) {
				if (divFlag == 0) {
					for (var key in this.eventDict) {

						if (this.eventDict.hasOwnProperty(key)) {
							timersList.insertAdjacentHTML('beforeend', 
									'<li>' + key + ': ' + replaceTimezone(this.eventDict[key]) + '</li>')
						}
					}
				}
				else if (divFlag == 1) {
					for (var key in this.eventDict) {

						if (this.eventDict.hasOwnProperty(key)) {
							timersList.insertAdjacentHTML('beforeend', 
									'<div>' + key + ': ' + replaceTimezone(this.eventDict[key]) + '</div>')
						}
					}
				}
			}
		}
	});
}

function saveEvents() {
	var eventTime = document.getElementsByName('timer-time');
	var eventName = document.getElementsByName('timer-name');
	var timersList = document.getElementById('timers');

	console.log("Inside save...")
	console.log(typeof this.eventDict !== "undefined")

	if(eventTime.length > 0 && eventName.length > 0) {
		var eventDateObj = new Date(eventTime[0].value);

		if (eventName[0].value.length > 0) {
			if (eventDateObj - Date.now() > 0) {

				this.eventDict[eventName[0].value] = eventDateObj.toUTCString()
				storage.set({events: this.eventDict}, function() {
					timersList.insertAdjacentHTML('beforeend', 
						'<li>' + eventName[0].value + ': ' + replaceTimezone(eventDateObj.toUTCString()) + '</li>')

					storage.get('events', function(items){
						if (typeof items.events !== "undefined")
							console.log(items.events)
					});
				});
			}
		}
	}
}