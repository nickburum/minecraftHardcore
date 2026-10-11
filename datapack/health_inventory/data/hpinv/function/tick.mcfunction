execute unless score #active hpinv.var matches 1 run return 0

scoreboard players add #ticks hpinv.var 1
execute if score #cooldown hpinv.var matches 1.. run scoreboard players remove #cooldown hpinv.var 1

# Deaths (dead players only match @a), then everyone alive.
execute as @a[tag=hpinv.player,scores={hpinv.deaths=1..}] at @s run function hpinv:event/death
execute as @e[type=player,tag=hpinv.player] at @s run function hpinv:player_tick

# Lock items never survive outside a locked slot.
execute as @e[type=minecraft:item] if items entity @s contents *[minecraft:custom_data~{hpinv_lock:true}] run kill @s

# The dragon is dead: challenge complete.
execute as @a[tag=hpinv.player,scores={hpinv.dragon=1..}] at @s run return run function hpinv:event/win

scoreboard players add #hud hpinv.var 1
execute if score #hud hpinv.var matches 10.. run function hpinv:hud/update
