#!/usr/bin/env bash

SOUND_FILE_PATH=""
VOLUME="100"

print_usage() {
  echo "Usage: playSound.sh --path <path to sound file> --volume <volume>"
}
while test $# -gt 0
do
        case "$1" in
          --path)
            shift
            SOUND_FILE_PATH="$1"
            ;;
          --volume)
            shift
            VOLUME="$1"
            ;;
          *)
            echo "Invalid argument"
            print_usage
            exit
            ;;
        esac
        shift
done

if [[ ${SOUND_FILE_PATH} == "" ]] || [[ ${VOLUME} == "" ]];then
  print_usage
  exit
fi

/usr/bin/amixer -q -M sset Master "${VOLUME}%"
/usr/bin/aplay "${SOUND_FILE_PATH}"
