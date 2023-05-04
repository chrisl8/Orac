#!/usr/bin/env bash

/usr/sbin/i2cset -a -y 1 0x04 101 0 i # Stop`
#/usr/sbini2cset -a -y 1 0x04 101 255 i # Full speed`
# TODO: Get fan speed and only set if it isn't?
# /usr/sbin/i2cget -a -y 1 0x04
# TODO: Monitor CPU temp and adjust fan speed.
