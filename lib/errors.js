const util = require('util')

module.exports = { UnknownTriggerError, IllegalTransitionError, UnknownMethodError }

function UnknownTriggerError (trigger) {
	this.message = util.format('unknown trigger "%s"', trigger)
	this.trigger = trigger
	Error.call(this)
	Error.captureStackTrace(this, UnknownTriggerError)
}

util.inherits(UnknownTriggerError, Error)

function IllegalTransitionError (transition) {
	this.message = util.format('transition "%j" is illegal', transition)
	this.transition = transition
	Error.call(this)
	Error.captureStackTrace(this, IllegalTransitionError)
}

util.inherits(IllegalTransitionError, Error)

function UnknownMethodError (method) {
	this.message = util.format('unknown method "%s"', method)
	this.method = method
	Error.call(this)
	Error.captureStackTrace(this, UnknownMethodError)
}

util.inherits(UnknownMethodError, Error)
