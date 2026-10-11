# As the human being sabotaged.
execute store result score #pick race.var run random value 1..7
execute if score #pick race.var matches 1 run return run function race:sabotage/creeper
execute if score #pick race.var matches 2 run return run function race:sabotage/butterfingers
execute if score #pick race.var matches 3 run return run function race:sabotage/fatigue
execute if score #pick race.var matches 4 run return run function race:sabotage/launch
execute if score #pick race.var matches 5 run return run function race:sabotage/blind
execute if score #pick race.var matches 6 run return run function race:sabotage/hunger
function race:sabotage/silverfish
