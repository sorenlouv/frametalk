const frametalk = {};
const MESSAGE_IDENTIFIER = 'FRAME_TALK_MESSAGE';

frametalk.send = function(otherWindow, name, data, targetOrigin = '*') {
	otherWindow.postMessage(
		{ MESSAGE_IDENTIFIER, name, data },
		targetOrigin
	);
};

frametalk.on = function(name, callback) {
	function handler(event) {
		if (event.data.MESSAGE_IDENTIFIER !== MESSAGE_IDENTIFIER || event.data.name !== name) {
			return;
		}
		callback(event, event.data.data);
	}

	window.addEventListener('message', handler, false);
	return () => window.removeEventListener('message', handler, false);
};

frametalk.request = function(otherWindow, name, data, targetOrigin = '*') {
	const id = getUniqueId();
	const uniqueName = name + '_' + id;
	const requestData = addRequestId(data, id);

	frametalk.send(otherWindow, name, requestData, targetOrigin);

	return new Promise(function(resolve) {
		var unsubscribe = frametalk.on(uniqueName, (event, responseData) => {
			unsubscribe();
			resolve(responseData);
		});
	});
};

frametalk.replyOn = function(name, callback) {
	return frametalk.on(name, (event, dataRaw) => {
		const otherWindow = frametalk._getSourceFrameWindow(event.source);
		const uniqueName = name + '_' + dataRaw.requestId;
		const data = omitRequestId(dataRaw);

		Promise.resolve(callback(event, data))
			.then((result) => {
				frametalk.send(otherWindow, uniqueName, result);
			});
	});
};

frametalk._getSourceFrameWindow = function(eventSource) {
	if (frametalk._isWindow(eventSource)) {
		return eventSource;
	}

	const sourceFrame = Array.from(document.getElementsByTagName('iframe')).filter(iframe => iframe.contentWindow === eventSource)[0];
	if (!sourceFrame) {
		console.error('Could not find iframe window');
		return;
	}

	return sourceFrame.contentWindow;
};

frametalk._isWindow = function(obj) {
	if (typeof(window.constructor) === 'undefined') {
		return obj instanceof window.constructor;
	} else {
		return obj.window === obj;
	}
};

function addRequestId(data, requestId) {
	return Object.assign({}, data, { requestId });
}

function omitRequestId(dataWithRequestId) {
	const dataWithoutRequestId = Object.assign({}, dataWithRequestId);
	delete dataWithoutRequestId.requestId;
	return dataWithoutRequestId;
}

let uniqueId = 0;
function getUniqueId() {
	return uniqueId++;
}

module.exports = frametalk;
