execute as @a[tag=elixir.craft_check,tag=elixir.craft_ok] at @s run function elixir:craft/accept
execute as @a[tag=elixir.craft_check,tag=!elixir.craft_ok] at @s run function elixir:craft/reject
tag @a remove elixir.craft_check
tag @a remove elixir.craft_ok
