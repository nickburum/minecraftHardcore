# Plays "the champion <name> has returned" if a clip exists for that player,
# otherwise the general announcement. Needs the resource pack.
execute unless data storage elixir:data voice_queue[0] run return fail
data modify storage elixir:tmp voice set from storage elixir:data voice_queue[0]
data remove storage elixir:data voice_queue[0]
execute if function elixir:announce/revived_voice_named run return 1
execute as @a at @s run playsound elixir:announcer.revived master @s ~ ~ ~ 1 1
