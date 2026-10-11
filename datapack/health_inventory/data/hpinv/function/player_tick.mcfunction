# As a living challenge player. Hearts = health rounded up to whole hearts (1 to 10).
execute store result score @s hpinv.h10 run data get entity @s Health 10
scoreboard players operation @s hpinv.hearts = @s hpinv.h10
scoreboard players add @s hpinv.hearts 19
scoreboard players operation @s hpinv.hearts /= #20 hpinv.var

execute if items entity @s player.cursor *[minecraft:custom_data~{hpinv_lock:true}] run item replace entity @s player.cursor with minecraft:air
scoreboard players set @s hpinv.dropflag 0
function hpinv:lock/enforce

execute if score @s hpinv.hearts < @s hpinv.prev run function hpinv:event/hearts_lost
execute if score @s hpinv.hearts > @s hpinv.prev run function hpinv:event/hearts_gained
scoreboard players operation @s hpinv.prev = @s hpinv.hearts

execute if dimension minecraft:the_nether unless entity @s[tag=hpinv.seen_nether] run function hpinv:event/nether
execute if dimension minecraft:the_end unless entity @s[tag=hpinv.seen_end] run function hpinv:event/end
execute if score @s hpinv.diamond matches 1.. unless entity @s[tag=hpinv.seen_diamond] run function hpinv:event/diamond
