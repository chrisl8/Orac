#!/usr/bin/env bash
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/home/chrisl8/.nvm/nvm.sh
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

pip install smbus2

if ! (command -v espeak >/dev/null); then
  sudo apt install espeak
fi

if ! (command -v pm2 >/dev/null); then
  npm i -g pm2
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:retain 1
fi

cd "${HOME}/Orac" || exit
pm2 start "${HOME}/Orac/node/pm2Config.json"
# If you want the terminal to stay open and show log, use this:
pm2 log
