const parser = require('./parser')
const runner = require('./runner')
const mapper = require('./mapper')
const { EventEmitter } = require('events')

module.exports = create
Object.assign(module.exports, require('./errors'))

function create ({
	definition,
	methods = { },
	apply,
	debug,
}) {
	if (!definition) {
		throw new Error('no definition')
	}

	if (typeof apply != 'function') {
		throw new Error('no runner')
	}

	const stateDefinitions = parser.parse(definition)

	const transitionsByTriggerName = mapper.getTransitionsByTriggerName(stateDefinitions)
	const methodsByName = mapper.getMethodsByName(methods)
	const trailersByStateAndTriggerName = mapper.getTrailersByStateAndTriggerName(stateDefinitions)

	const emitter = new EventEmitter()

	return new Proxy({
		run: runner.create({ transitionsByTriggerName, methodsByName, trailersByStateAndTriggerName, apply, debug }),
		check: (state, transition) => Boolean(transition.from.includes(state)),
		emit: (...args) => emitter.emit(...args),
		on: (...args) => emitter.on(...args),
	}, {
		get: (target, property) => property in target ? target[property] : methods[property],
		set: () => undefined,
	})
}
