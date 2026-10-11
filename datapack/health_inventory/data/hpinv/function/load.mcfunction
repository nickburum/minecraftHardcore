# Minecraft, but my health is my inventory. Setup, runs on /reload.
scoreboard objectives add hpinv.var dummy
scoreboard objectives add hpinv.h10 dummy
scoreboard objectives add hpinv.hearts dummy
scoreboard objectives add hpinv.prev dummy
scoreboard objectives add hpinv.lost dummy
scoreboard objectives add hpinv.drops dummy
scoreboard objectives add hpinv.dropflag dummy
scoreboard objectives add hpinv.deaths deathCount
scoreboard objectives add hpinv.dragon minecraft.killed:minecraft.ender_dragon
scoreboard objectives add hpinv.diamond minecraft.picked_up:minecraft.diamond
scoreboard players set #20 hpinv.var 20
scoreboard players set #60 hpinv.var 60
scoreboard players set #3600 hpinv.var 3600
execute unless score #active hpinv.var matches 0.. run scoreboard players set #active hpinv.var 0
