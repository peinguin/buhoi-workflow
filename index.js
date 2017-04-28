const Promise = require('bluebird')
const fs = require('fs')
const util = require('util')
const pegjs = require('pegjs')
const { CronJob } = require('cron')

const parser = pegjs.generate(fs.readFileSync(`${__dirname}/grammar.peg`, 'utf-8'))

module.exports = create
Object.assign(module.exports, { UnknownTriggerError, IllegalTransitionError })

function create ({
	definition,
	runner,
	methods = { },
	schedule = { },
	debug,
}) {
	check({ definition, runner })

	const states = parse(definition)

	const trailers = index(states)
	const triggers = repack(states)

	run(schedule, on)

	return id => ({
		check: transition => Boolean(transition.from.includes(id)),
		run: (name, args) => on(id, name, args)
	})

	function on (id, name, args) {
		const trigger = triggers[name]
		if (!trigger) {
			throw new UnknownTriggerError(name)
		}
		const transition = { id, from: trigger.from, to: trigger.to, trigger: name, args }
		if (transition.from.length == 0) {
			throw new IllegalTransitionError(transition)
		}
		if (debug) {
			debug(undefined, transition)
		}
		return Promise.resolve(methods[name])
			.then(guard => guard ? Promise.try(() => guard(id, name, args)) : undefined)
			.then(() => runner(transition))
			.tap(state => {
				if (!state) {
					throw new IllegalTransitionError(transition)
				}
				if (debug) {
					debug(state, transition)
				}
			})
			.then(state => trailers[state][name] ? trailers[state][name](transition) : undefined)
	}
}

function check ({ definition, runner }) {
	if (!definition) {
		throw new Error('no definition')
	}

	if (!runner || typeof runner != 'function') {
		throw new Error('no runner')
	}
}

function parse (definition) {
	return parser.parse(definition)
}

function index (definition) {
	return definition.reduce(
		(d, s) => Object.assign(d, {
			[s.state]: s.transitions.reduce(
				(r, t) => Object.assign(r, {
					[t.trigger]: t.afterTransition
				}),
				{ }
			)
		}),
		{ }
	)
}

function repack (definition) {
	return definition.reduce((result, s) => {
		s.transitions.forEach(({ trigger, nextState }) => {
			result[trigger] = result[trigger] || { from: [], to: nextState }
			result[trigger].from.push(s.state)
		})
		return result
	}, { })
}

function run (schedule, handler) {
	Object
		.keys(schedule)
		.map(pattern => ({
			pattern,
			triggers: Array.isArray(schedule[pattern])
				? schedule[pattern]
				: [schedule[pattern]]
		}))
		.forEach(({ pattern, triggers }) => new CronJob(
			pattern, () => triggers.forEach(t => on(undefined, t)), null, true
		))
}

function UnknownTriggerError (trigger) {
	this.message = util.format('unknown trigger "%s"', trigger)
	this.trigger = trigger
	Error.call(this)
	Error.captureStackTrace(this, UnknownTriggerError)
}

util.inherits(UnknownTriggerError, Error)

function IllegalTransitionError (transition) {
	this.message = util.format('transition %j is illegal', transition)
	this.transition = transition
	Error.call(this)
	Error.captureStackTrace(this, IllegalTransitionError)
}

util.inherits(IllegalTransitionError, Error)
