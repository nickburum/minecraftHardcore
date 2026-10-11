# Macro: slot. Throws the slot's item on the ground in front of the player.
summon minecraft:item ^ ^1.3 ^0.6 {Tags:["hpinv.new"],PickupDelay:40s,Item:{id:"minecraft:stone",count:1}}
$item replace entity @n[type=minecraft:item,tag=hpinv.new] contents from entity @s $(slot)
data modify entity @n[type=minecraft:item,tag=hpinv.new] Motion set value [0.0d,0.25d,0.0d]
tag @e[type=minecraft:item,tag=hpinv.new] remove hpinv.new
scoreboard players add @s hpinv.drops 1
scoreboard players set @s hpinv.dropflag 1
