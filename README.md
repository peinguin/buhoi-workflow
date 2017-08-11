# buhoi-workflow
No triggers with same name point to different nodes!

state1:
  action -> state2
  approve -> state2

state2:
  approve -> state3 // will point to state 2 during a bug in mapper

state3:
  action3 -> state1

WIP (do not use until ready)

## License

MIT
