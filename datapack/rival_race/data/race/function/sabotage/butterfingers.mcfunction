# Knocks the held item out of the player's hand. Falls back to fatigue if they hold nothing.
execute unless items entity @s weapon.mainhand * run return run function race:sabotage/fatigue
function race:voice/sabotage_butterfingers
summon minecraft:item ^ ^1.3 ^1.5 {Tags:["race.new"],PickupDelay:40s,Item:{id:"minecraft:stone",count:1}}
item replace entity @n[type=minecraft:item,tag=race.new] contents from entity @s weapon.mainhand
item replace entity @s weapon.mainhand with minecraft:air
data modify entity @n[type=minecraft:item,tag=race.new] Motion set value [0.0d,0.3d,0.0d]
tag @e[type=minecraft:item,tag=race.new] remove race.new
