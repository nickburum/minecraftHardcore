#!/bin/bash
# usage: setup_server.sh <dir> <port> <rconport>
d=$1; src="$(cd "$(dirname "$0")/.." && pwd)"; mkdir -p $d/world/datapacks; cd $d
echo eula=true > eula.txt
cat > server.properties <<P
online-mode=false
hardcore=true
difficulty=hard
server-port=$2
enable-rcon=true
rcon.port=$3
rcon.password=test
level-type=minecraft\:flat
spawn-protection=0
generate-structures=false
max-players=10
view-distance=4
simulation-distance=4
P
rm -rf world/datapacks/elixir_of_life
cp -r "$src/datapack/elixir_of_life" world/datapacks/
