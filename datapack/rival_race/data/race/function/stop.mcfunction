# /function race:stop  Ends the race.
scoreboard players set #active race.var 0
schedule clear race:countdown/3
schedule clear race:countdown/2
schedule clear race:countdown/1
schedule clear race:countdown/go
