# Uses storage elixir:tmp req.id. Leaves the player who is out in elixir:tmp target.
# Returns 1 if the revive can go ahead; otherwise explains why and fails.
execute unless function elixir:revive/has_elixir run tellraw @s {text:"You need an Elixir of Life in your inventory.",color:"red"}
execute unless function elixir:revive/has_elixir run return fail
execute unless score @s elixir.lives matches 2.. run tellraw @s {text:"You're on your last life. You can't give it away.",color:"red"}
execute unless score @s elixir.lives matches 2.. run return fail
data remove storage elixir:tmp target
function elixir:revive/find_fallen with storage elixir:tmp req
execute unless data storage elixir:tmp target run tellraw @s {text:"That player is already back.",color:"red"}
execute unless data storage elixir:tmp target run return fail
return 1
