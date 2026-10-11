function hpinv:hud/time
tellraw @a {text:"──── Challenge stats ────",color:"gold"}
tellraw @a [{text:"Time: ",color:"gray"},{score:{name:"#h",objective:"hpinv.var"},color:"white"},{text:"h "},{score:{name:"#m",objective:"hpinv.var"},color:"white"},{text:"m "},{score:{name:"#s",objective:"hpinv.var"},color:"white"},{text:"s"}]
tellraw @a [{text:"Deaths: ",color:"gray"},{score:{name:"#deaths",objective:"hpinv.var"},color:"white"}]
execute as @a[tag=hpinv.player] run tellraw @a [{selector:"@s",color:"yellow"},{text:": lost ",color:"gray"},{score:{name:"@s",objective:"hpinv.lost"},color:"white"},{text:" hearts, dropped ",color:"gray"},{score:{name:"@s",objective:"hpinv.drops"},color:"white"},{text:" items",color:"gray"}]
