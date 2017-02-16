function masterFn() {
	var capp = new countApp();

	capp.restoreCountdowns(document.getElementById('timers'), 0);
	document.getElementById('add-button').addEventListener('click', capp.saveEvents);
}

// waits until initial document without stylesheet and other resources is load
document.addEventListener('DOMContentLoaded', masterFn);