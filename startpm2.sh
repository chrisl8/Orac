#!/usr/bin/env bash

export PATH=/home/ovos/bin:/home/ovos/bin/node/bin:${PATH}
cd "/home/ovos/Orac" || exit
pm2 start "/home/ovos/Orac/node/pm2Config.json"
