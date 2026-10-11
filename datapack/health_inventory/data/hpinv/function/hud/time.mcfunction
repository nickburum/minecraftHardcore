# #ticks -> #h #m #s
scoreboard players operation #s hpinv.var = #ticks hpinv.var
scoreboard players operation #s hpinv.var /= #20 hpinv.var
scoreboard players operation #h hpinv.var = #s hpinv.var
scoreboard players operation #h hpinv.var /= #3600 hpinv.var
scoreboard players operation #m hpinv.var = #s hpinv.var
scoreboard players operation #m hpinv.var %= #3600 hpinv.var
scoreboard players operation #m hpinv.var /= #60 hpinv.var
scoreboard players operation #s hpinv.var %= #60 hpinv.var
