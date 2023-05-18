#!/usr/bin/env bash

echo "Hello World"
aplay -l
python /home/chrisl8/mark-ii-hardware-testing/utils/set_volume_tas5806.py 370
aplay /usr/share/sounds/alsa/Noise.wav
#XDG_RUNTIME_DIR=/run/user/1000 espeak "Hello World" --stdout | aplay

