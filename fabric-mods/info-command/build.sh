#!/bin/bash
# Builds info-command.jar with plain javac (JDK 25, like Minecraft 26.x) (26.x ships with readable names, so no Fabric Loom is needed).
#   ./build.sh <fabric server dir>        (set JAVAC/JAR if javac on PATH is older than 25)
# The server dir must have been started once, so it has versions/<mc>/server-<mc>.jar, the
# libraries folder and Fabric API in mods/.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
srv="$(cd "${1:?usage: build.sh <fabric server dir>}" && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
api="$(ls "$srv"/mods/fabric-api-*.jar | head -1)"
unzip -q -o -j "$api" 'META-INF/jars/fabric-command-api-v2-*.jar' 'META-INF/jars/fabric-api-base-*.jar' -d "$work/api"
cp="$(ls "$srv"/versions/*/server-*.jar | head -1):$(find "$srv/libraries" -name '*.jar' | tr '\n' ':')$(ls "$work"/api/*.jar | tr '\n' ':')"
mkdir -p "$work/classes"
"${JAVAC:-javac}" --release 25 -proc:none -cp "$cp" -d "$work/classes" $(find "$here/src/main/java" -name '*.java')
cp -r "$here/src/main/resources/." "$work/classes/"
(cd "$work/classes" && "${JAR:-jar}" --create --file "$here/info-command-1.0.0.jar" .)
echo "built $here/info-command-1.0.0.jar"
