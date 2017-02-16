function masterFn() {
	var capp = new countApp();

	capp.restoreCountdowns(document.body, 1);
}

document.addEventListener('DOMContentLoaded', masterFn);