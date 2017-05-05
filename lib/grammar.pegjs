Expression = FSM

FSM = Space* NewLine* s:StateDefinition+ NewLine* Space* {
	return s
}

StateDefinition = Space* s:Name Space* ":" Space* NewLine+ t:Transition+ {
	return { state: s, transitions: t }
}

Transition = Space* t:Name Space* "->" Space* s:Name Space* a:Aftermath? Space* NewLine* {
	return { trigger: t, nextState: s, afterTransition: a }
}

Aftermath = "(" m:(m:Name ","? Space* { return m })+ ")" {
	return m
}

Name = w:(w:Word Space? { return w })+ {
	return w.join(' ')
}

Word = w:[A-z!]+ { return w.join('') }

Space = [ \t]
NewLine = "\n"
