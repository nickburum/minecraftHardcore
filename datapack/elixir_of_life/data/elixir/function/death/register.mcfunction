# Macro: id, name. Adds the player to the fallen list and the revive menu.
$data remove storage elixir:data fallen[{id:$(id)}]
$data remove storage elixir:data buttons[{action:{command:"trigger elixir.revive set $(id)"}}]
$data modify storage elixir:data fallen append value {id:$(id),name:"$(name)"}
$data modify storage elixir:data buttons append value {label:{text:"$(name)",color:"gold"},tooltip:{text:"Return $(name) to the realm"},width:200,action:{type:"minecraft:run_command",command:"trigger elixir.revive set $(id)"}}
