#!/usr/bin/env bash
# shellcheck disable=SC2059

set -e

YELLOW='\033[1;33m'
LIGHTBLUE='\033[1;34m'
RED='\033[0;31m'
NC='\033[0m' # NoColor

if [[ "${USER}" != ovos ]]; then
  echo "ONLY run this as the ovos user!"
  exit 1
fi

printf "\n${YELLOW}[Installing and Initializing the Latest Version of Node.js]${NC}\n"

printf "${LIGHTBLUE}[Installing/Updating Node Version Manager]${NC}\n"
if [[ -e ${HOME}/.nvm/nvm.sh ]]; then
  printf "${LIGHTBLUE}Deactivating existing Node Version Manager:${NC}\n"
  export NVM_DIR="${HOME}/.nvm"
  # shellcheck source=/home/chrisl8/.nvm/nvm.sh
  [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" # This loads nvm
  nvm deactivate
fi

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/home/chrisl8/.nvm/nvm.sh
[[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" # This loads nvm

export NVM_SYMLINK_CURRENT=true
if ! (grep NVM_SYMLINK_CURRENT ~/.bashrc >/dev/null); then
  printf "\n${YELLOW}[Setting the NVM current environment in your .bashrc file]${NC}\n"
  sh -c "echo \"export NVM_SYMLINK_CURRENT=true\" >> ~/.bashrc"
fi

nvm install node --latest-npm
nvm use node
nvm alias default node

printf "\n${YELLOW}[Grabbing/Updating global dependencies for node packages]${NC}\n"
printf "${LIGHTBLUE}You may get some errors here, that is normal. As long as things work, it is OK.$NC\n"
cd
printf "\n${YELLOW}[PM2 for running Robot service]$NC\n"
npm install -g pm2

printf "\n${YELLOW}[Grabbing node dependencies for scripts]${NC}\n"
printf "${LIGHTBLUE}You may get some errors here, that is normal. As long as things work, it is OK.$NC\n"
cd "${HOME}/Orac/node" || exit
npm ci

printf "\n${YELLOW}[Updating Majaro]${NC}\n"
sudo pacman -Syu

printf "\n${YELLOW}[Updating PIP]${NC}\n"
sudo /usr/bin/python -m pip install --upgrade pip

printf "\n${YELLOW}[Listing Outdated Python Packages]${NC}\n"
sudo pip list --outdated

printf "\n${YELLOW}[Updating all Python Packages]${NC}\n"
# Use the unpinned requirements file to force everything to install with latest versions possible
sudo pip install --upgrade -r "${HOME}/Orac/ovos-setup-stuff/requirements-unpinned.txt"

printf "\n${RED}You should reboot now.${NC}\n\n"
