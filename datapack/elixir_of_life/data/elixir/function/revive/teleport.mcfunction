# 1. Their own spawn point (bed, respawn anchor, or /spawnpoint).
execute if function elixir:revive/tp_respawn run return 1
# 2. The world spawn set by an operator with elixir:admin/set_world_spawn.
execute if data storage elixir:data world_spawn run return run function elixir:revive/tp_to with storage elixir:data world_spawn
# 3. Where the elixir was used.
execute if data storage elixir:tmp target.fallback.x run return run function elixir:revive/tp_to with storage elixir:tmp target.fallback
