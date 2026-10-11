# Hides or shows the hearts/slots/timer bar (handy for clean recording).
execute if score #hud_off hpinv.var matches 1 run return run scoreboard players set #hud_off hpinv.var 0
scoreboard players set #hud_off hpinv.var 1
