module.exports = {
	getTrailersByStateAndTriggerName,
	getTransitionsByTriggerName,
	getMethodsByName,
}

function getTrailersByStateAndTriggerName (stateDefinitions) {
	return stateDefinitions.reduce(byState, { })
	function byState (trailers, stateDefinition) {
		return Object.assign(trailers, { [stateDefinition.state]: stateDefinition.transitions.reduce(byTriggerName, { }) })
		function byTriggerName(trailer, transition) {
			return Object.assign(trailer, { [transition.trigger]: transition.afterTransition })
		}
	}
}

function getTransitionsByTriggerName (stateDefinitions) {
	return stateDefinitions.reduce((transitions, stateDefinition) => {
		stateDefinition.transitions.forEach(({ trigger, nextState }) => {
			transitions[trigger] = transitions[trigger] || { from: [], to: nextState }
			transitions[trigger].from.push(stateDefinition.state)
		})
		return transitions
	}, { })
}

function getMethodsByName (methods) {
	return Object.keys(methods).reduce(
		(methodsByName, key) => Object.assign(methodsByName, { [camelCaseToPhrase(key)]: methods[key] }),
		{ }
	)
}

function camelCaseToPhrase (name) {
	return name.replace(/[A-Z]/g, it => ' ' + it.toLowerCase())
}
