# Macro: id. Removes the player from the fallen list and the revive menu.
$data remove storage elixir:data fallen[{id:$(id)}]
$data remove storage elixir:data buttons[{action:{command:"trigger elixir.revive set $(id)"}}]
