# Race the bot to the End. Setup, runs on /reload.
scoreboard players set #20 race.var 20
scoreboard objectives add race.var dummy
scoreboard objectives add race.stage dummy {text:"⚑ Race to the End",color:"aqua",bold:true}
scoreboard objectives add race.deaths deathCount
scoreboard objectives add race.dragon minecraft.killed:minecraft.ender_dragon
execute unless score #active race.var matches 0.. run scoreboard players set #active race.var 0
execute unless score #sabotage race.var matches 0.. run scoreboard players set #sabotage race.var 1
execute unless data storage race:cfg bot run data modify storage race:cfg bot set value "RivalBot"
