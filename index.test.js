const frametalk = require('./index');

describe('frametalk', () => {
	describe('one-way postMessage', () => {
		let eventName, eventData, otherWindow, event, data, removeEventListener;

		beforeEach(done => {
			eventName = 'simple-event';
			eventData = {foo: 'bar'};
			otherWindow = window;

			removeEventListener = frametalk.on(eventName, (_event, _data) => {
				event = _event;
				data = _data;
				done();
			});

			frametalk.send(otherWindow, eventName, eventData);
		});

		afterEach(() => {
			removeEventListener();
		});

		it('should return data', () => {
			expect(data).toEqual(eventData);
		});

		it('should return post message event', () => {
			expect(event.type).toBe('message');
			expect(event.data.MESSAGE_IDENTIFIER).toBe('FRAME_TALK_MESSAGE');
			expect(event.data.name).toBe(eventName);
			expect(event.data.data).toEqual(eventData);
		});
	});

	describe('two-way postMessaging', () => {
		beforeEach(() => {
			spyOn(frametalk, '_getSourceFrameWindow').and.returnValue(window);
		});

		it('should return data for normal value', () => {
			const eventData = {foo: 'bar'};
			const eventName = 'promise-based-event1';
			frametalk.replyOn(eventName, (event) => (eventData));
			return frametalk.request(window, eventName)
				.then((res) => {
					expect(res).toEqual(eventData);
				});
		});

		it('should return data for promise value', () => {
			const eventData = {foo: 'bar'};
			const eventName = 'promise-based-event2';
			frametalk.replyOn(eventName, (event) => (Promise.resolve(eventData)));
			return frametalk.request(window, eventName)
				.then((res) => {
					expect(res).toEqual(eventData);
				});
		});

		it('should reply for additional calls', () => {
			let counter = 0;
			const eventName = 'promise-based-event3';
			frametalk.replyOn(eventName, (event) => ++counter);
			return frametalk.request(window, eventName)
				.then((res) => {
					expect(res).toEqual(1);
				})
				.then(() => {
					return frametalk.request(window, eventName)
				})
				.then((res) => {
					expect(res).toEqual(2);
				});
		});
	});
});
