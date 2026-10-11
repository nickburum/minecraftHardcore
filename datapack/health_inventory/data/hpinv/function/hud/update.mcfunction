scoreboard players set #hud hpinv.var 0
execute if score #hud_off hpinv.var matches 1 run return 0
function hpinv:hud/time
execute as @e[type=player,tag=hpinv.player] run title @s actionbar [{text:"❤ ",color:"red"},{score:{name:"@s",objective:"hpinv.hearts"},color:"red"},{text:" hearts = ",color:"gray"},{score:{name:"@s",objective:"hpinv.hearts"},color:"white"},{text:" slots   ",color:"gray"},{text:"⌚ ",color:"yellow"},{score:{name:"#h",objective:"hpinv.var"},color:"yellow"},{text:"h ",color:"gray"},{score:{name:"#m",objective:"hpinv.var"},color:"yellow"},{text:"m ",color:"gray"},{score:{name:"#s",objective:"hpinv.var"},color:"yellow"},{text:"s",color:"gray"}]
