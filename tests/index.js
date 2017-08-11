const buhoiWorkflow = require('../lib')

describe('buhoi-workflow', function () {
	let state, workflow
	const definition = `
		left:
			go tick -> right (action fired)
		right:
			go tack -> left (another action fired)
	`

	const fsmApply = transition => {
		if (workflow.check(state, transition)) {
			state = transition.to
			return transition.from
		}
	}

	it('should switch state and run side effect', function (done) {
		state = 'left'
		const goTickMethodSpy = sinon.spy()
		const actionFiredMethodSpy = sinon.spy()

		workflow = buhoiWorkflow({
			methods: {
				goTick: goTickMethodSpy,
				actionFired: actionFiredMethodSpy
				goTack: (id, name, args) => '"go tack" was called',
				anotherActionFired: transition => '"another action fired" was called'
			},
			apply: transition => fsm.check(state, transition) ? state = transition.to : undefined,
			debug: console.log,
		})
		fsm.run(1, 'go tick').then(done).catch(done)
	})
})
