# Any craft of the elixir recipe. Checked next tick, once both advancements have fired.
advancement revoke @s only elixir:crafted_any
tag @s add elixir.craft_check
schedule function elixir:craft/verify 1t append
