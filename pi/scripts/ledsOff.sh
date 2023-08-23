#!/usr/bin/env bash

# https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/hardware_tests/ledtest_old.py
# cmd =   "i2cset -y 1 %d %d %d %d %d i " % (
#             self.device_addr,
#             pixel,
#             red_val,
#             green_val,
#             blue_val)

/usr/sbin/i2cset -a -y 1 0x04 0 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 1 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 2 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 3 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 4 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 5 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 6 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 7 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 8 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 9 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 10 0 0 0 i
/usr/sbin/i2cset -a -y 1 0x04 11 0 0 0 i
