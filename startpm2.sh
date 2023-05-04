#!/usr/bin/env bash
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/home/chrisl8/.nvm/nvm.sh
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

cd "${HOME}/Orac" || exit
pm2 start "${HOME}/Orac/node/pm2Config.json"
# If you want the terminal to stay open and show log, use this:
pm2 log