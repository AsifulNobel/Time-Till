function masterFn() {
	var capp = new countApp();

	capp.restoreCountdowns(document.getElementById('timers'), 0);
	document.getElementById('add-button').addEventListener('click', capp.saveEvents);
}

document.addEventListener('DOMContentLoaded', masterFn);