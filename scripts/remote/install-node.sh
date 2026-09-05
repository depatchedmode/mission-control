set -eu
cd /tmp
curl -fsSLO https://nodejs.org/dist/v24.11.1/node-v24.11.1-linux-arm64.tar.xz
curl -fsSLO https://nodejs.org/dist/v24.11.1/SHASUMS256.txt
node_archive=node-v24.11.1-linux-arm64.tar.xz
awk -v name="$node_archive" '$2 == name {print}' SHASUMS256.txt | sha256sum -c -
mkdir -p "$HOME/.local/node"
tar -xJf "$node_archive" --strip-components=1 -C "$HOME/.local/node"
"$HOME/.local/node/bin/node" --version
