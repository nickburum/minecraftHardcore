scoreboard players set #epoch elixir.var 2
data modify storage elixir:data fallen set value []
data modify storage elixir:data buttons set value []
data modify storage elixir:data pending set value []
scoreboard players reset * elixir.pending
tellraw @a [{text:"[Three Lives] ",color:"gold",bold:true},{text:"New rules: everyone has 3 lives. Anyone who was out is coming back.",color:"yellow"}]
