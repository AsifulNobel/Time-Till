function masterFn() {
	restoreCountdowns(document.body, 1);
}

// waits until initial document without stylesheet and other resources is load
document.addEventListener('DOMContentLoaded', masterFn);