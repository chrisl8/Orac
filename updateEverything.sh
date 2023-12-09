#!/usr/bin/env bash
# shellcheck disable=SC2059

YELLOW='\033[1;33m'
LIGHTBLUE='\033[1;34m'
NC='\033[0m' # NoColor

printf "\n${YELLOW}This assumes you already ran updateAllTheThings.sh${NC}\n"

printf "\n${YELLOW}[Grabbing node dependencies for scripts]${NC}\n"
printf "${LIGHTBLUE}You may get some errors here, that is normal. As long as things work, it is OK.$NC\n"
cd "${HOME}/Orac/node" || exit
npm ci

pm2 restart all
