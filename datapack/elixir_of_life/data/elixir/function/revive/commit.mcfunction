# Macro: id, name. Moves the player from the fallen list to the pending list.
# The scoreboard works by name, so this also covers players who are offline:
# they come back the next time they join.
$data remove storage elixir:data fallen[{id:$(id)}]
$data remove storage elixir:data buttons[{action:{command:"trigger elixir.revive set $(id)"}}]
$data remove storage elixir:data pending[{id:$(id)}]
data modify storage elixir:data pending append from storage elixir:tmp target
$scoreboard players set $(name) elixir.pending 1
