module.exports = { render }

function render (stateDefinitions) {
	const graph = stateDefinitions.map(s => s.transitions
		.map(t =>
			`\t"${s.state}" -> "${t.nextState}" [label="${t.trigger}`
			+ (t.afterTransition ? `\\n${t.afterTransition.join('\\n')}"]` : '"]')
		).join('\n')
	).join('\n\n')
	return `digraph {\n${graph}\n}`
}
