# Usage: /function elixir:admin/set_lives {name:"Steve",lives:3}   (1 to 3). Doesn't revive someone who is out; use admin/revive for that.
$scoreboard players set $(name) elixir.lives $(lives)
$tellraw @s [{text:"[Three Lives] ",color:"gold"},{text:"$(name)",color:"yellow"},{text:" now has $(lives) lives.",color:"gray"}]
