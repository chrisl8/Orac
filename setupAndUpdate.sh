#!/usr/bin/env bash
# shellcheck disable=SC2059

YELLOW='\033[1;33m'
LIGHTBLUE='\033[1;34m'
NC='\033[0m' # NoColor

printf "\n${YELLOW}This assumes you already ran updateAllTheThings.sh${NC}\n"

if ! (command -v espeak >/dev/null); then
  printf "\n${LIGHTBLUE}Installing espeak.$NC\n"
  sudo apt install espeak
fi

if ! (command -v pm2 >/dev/null); then
  printf "\n${LIGHTBLUE}Installing PM2.$NC\n"
  npm i -g pm2
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:retain 1
fi

printf "\n${YELLOW}[Grabbing node dependencies for scripts]${NC}\n"
printf "${LIGHTBLUE}You may get some errors here, that is normal. As long as things work, it is OK.$NC\n"
cd "${HOME}/Orac/node" || exit
npm ci

if ! (crontab -l >/dev/null 2>&1) || ! (crontab -l | grep startpm2 >/dev/null 2>&1); then
  printf "\n${YELLOW}[Adding cron job to start Orac on system reboot.]${NC}\n"
  # https://stackoverflow.com/questions/4880290/how-do-i-create-a-crontab-through-a-script
  (
    echo "@reboot ${HOME}/Orac/startpm2.sh > ${HOME}/crontab.log"
  ) | crontab -
fi

pm2 restart all
