#!/usr/bin/env bash

export PATH=/home/mycroft/bin:/home/mycroft/bin/node/bin:${PATH}
cd "/home/mycroft/Orac" || exit
pm2 start "/home/mycroft/Orac/node/pm2Config.json"
