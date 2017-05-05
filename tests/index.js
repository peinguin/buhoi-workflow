const buhoiWorkflow = require('../lib')

describe('buhoi-workflow', function () {
	it('should not crash', function (done) {
		let state = 'left'
		const fsm = buhoiWorkflow({
			definition: `
				left:
					go tick -> right
				right:
					go tack -> left
			`,
			methods: {
				goTick: () => console.log('tick'),
				goTack: () => console.log('tack'),
			},
			apply: transition => fsm.check(state, transition) ? state = transition.to : undefined,
			debug: console.log,
		})
		fsm.run(1, 'go tick').then(done).catch(done)
	})
})