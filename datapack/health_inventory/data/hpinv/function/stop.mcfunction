# /function hpinv:stop  Ends the challenge and gives every slot back.
scoreboard players set #active hpinv.var 0
schedule clear hpinv:countdown/3
schedule clear hpinv:countdown/2
schedule clear hpinv:countdown/1
schedule clear hpinv:countdown/go
clear @a *[minecraft:custom_data~{hpinv_lock:true}]
tag @a remove hpinv.player
