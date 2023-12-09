#!/usr/bin/env bash

TEXT_TO_SAY=""
VOLUME="100"

print_usage() {
  echo "Usage: speak.sh --text <text to say> --volume <volume>"
}
while test $# -gt 0
do
        case "$1" in
          --text)
            shift
            TEXT_TO_SAY="$1"
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

if [[ ${TEXT_TO_SAY} == "" ]] || [[ ${VOLUME} == "" ]];then
  print_usage
  exit
fi

/usr/bin/amixer -q -M sset Master "${VOLUME}%"
/usr/bin/espeak -v en-scottish -p 0 -s 150 "${TEXT_TO_SAY}"
