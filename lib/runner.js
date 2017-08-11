const Promise = require('bluebird')
const { UnknownTriggerError, IllegalTransitionError, UnknownMethodError } = require('./errors')

module.exports = { create }

function create ({
	transitionsByTriggerName,
	methodsByName,
	trailersByStateAndTriggerName,
	apply,
	debug,
}) {
	return function run (id, name, args) {
		const definition = transitionsByTriggerName[name]
		if (!definition) {
			throw new UnknownTriggerError(name)
		}

		const transition = Object.assign({ id, name, args }, definition)
		if (debug) {
			debug(undefined, transition)
		}

		return Promise.resolve(methodsByName[name])
			.then(guard => guard ? guard(id, name, args) : undefined)
			.then(() => apply(transition))
			.tap(state => {
				if (!state) {
					throw new IllegalTransitionError(transition)
				}
				if (debug) {
					debug(state, transition)
				}
			})
			.then(state => trailersByStateAndTriggerName[state] ? trailersByStateAndTriggerName[state][name] : undefined)
			.then(trailers => {
				if (debug) {
					debug({trailers})
				}

				return trailers || []
			})
			.map(trailer => {
				if (!methodsByName[trailer]) {
					throw new UnknownMethodError(trailer)
				}

				return methodsByName[trailer](transition)
			})
			.then(Promise.all)
			.return()
	}
}
