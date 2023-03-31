TODO:

Alert me when watch is fully charged, so I can put it back on.

Check if:
 - Watch is not fully or almost fully charged
 - and I haven't charged it today
 - and I appear to be in my office
   - Not known to be away from home and
   - Motion sensor recent
   - Lights on in office
 - then alert me to charge my watch.

Some events happen on HA. It has its own "automations" but I find them clunky,
but could i have HA essentially CALL this API instead of polling a LOT?
Or should I just poll A LOT?

If the wall switch in the office is turned off:
1. Turn off all office lights.
2. Turn the wall switch back on. ;)

When watch is 100% charged, alert me to put it back on.
battery_status: 'Charged',
battery: 100,


Things HA is doing by itself already:
Turn on office lights when Office motion happens.

## Setup

# SJ201 Reference
The board on the top of the Mark II dev kit is called the SJ201.

Hardware Information
https://github.com/MycroftAI/hardware-mycroft-mark-II/blob/master/mark-II-Rpi-devkit/KiCAD/SJ201-Raspberry%20Pi%204%20Daughterboard/README.md

The primary information about it is here:
https://github.com/MycroftAI/hardware-mycroft-mark-II
but there is a more thorough testing suite that should help guide how to connect to all of the features here:
https://github.com/MycroftAI/mark-ii-hardware-testing

## Raspberry Pi Install and Configuration
 - Use the [Raspberry Pi Imager](https://www.raspberrypi.com/software/) to install  Raspberry Pi OS (64-bit)
 - Configuration
   - Run `sudo raspi-config` (Note: There is a GUI version of this but it seems to be missing several options.)
     - System Options
       - Set your host name to `orac`
     - Display Options
       - Disable Screen Blanking (If you like, I do)
     - Interface Options
       - Enable Legacy Camera (https://github.com/MycroftAI/mark-ii-hardware-testing)
         - I'm not 100% sure if this is required to use the camera or only for how Mycroft wanted to use it. Needs testing.
       - Enable SSH
       - Enable SPI (https://github.com/MycroftAI/mark-ii-hardware-testing)
       - Enable I2C (https://github.com/MycroftAI/mark-ii-hardware-testing)
         - One of the above two makes the touchscreen work, both in `evtest` and in xWindows.

### Grab the Mycroft test code in case you need it
```
cd
git clone git@github.com:MycroftAI/mark-ii-hardware-testing.git
```

### Configure boot parameters
Edit `/boot/config.txt`

UN-comment the line
```
dtparam=i2s=on
```
COMMENT the line:
```
#dtparam=audio=on
```
In other words turn on i2s and turn off the default audio device

NOTE: I'm not 100% sure whether the above is all I need,  
as I also edited init_hardware.sh to change /home/pi/venv to /home/chrisl8/venv  
and then ran:
```
cd ${HOME}/mark-ii-hardware-testing
init_hardware.sh
```
and rebooted.

You may have to run this on every boot?
```
cd ${HOME}/mark-ii-hardware-testing
init_hardware.sh
```

### Verify SJ201 board exists and find version
Reference: https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/init_hardware.sh
`sudo apt install i2c-tools` - Note, I found this already installed, so maybe not required?

Reference: https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/hardware_tests/auto_detect_sj201.py

View all `i2c` devices:
```
❯ sudo i2cdetect -a -y 1
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00: -- -- -- -- 04 -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- 2c -- -- 2f
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
```

tiny_address = "04"
xmos_address = "2c"
ti_address = "2f"

"Old" SJ201 has all 3.

View all `spi` devices:
```
❯ ls -l /dev/spidev*
crw-rw---- 1 root spi 153, 0 Feb 28 19:41 /dev/spidev0.0
crw-rw---- 1 root spi 153, 1 Feb 28 19:41 /dev/spidev0.1
```

### Test Touchscreen
 - First, the touchscreen SHOULD work in the GUI desktop once SPI and I2C are enabled (I'm not sure which of those two is the key)
 - Install `evtest` and test touchscreen
   - `sudo apt intall evtest`
     - Reference: https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/init_hardware.sh
   - Run:
`sudo evtest`
   - and, device `event0` should look like this:
     - Reference: https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/utils/async_touch.py
```
/dev/input/event0:      raspberrypi-ts
```
 - Note that if set up correctly, that is the ONLY device listed apart from possibly any keyboard/mouse you connected.
   - While without SPI or I2C turned on, you will see an array of devices for some reason, none of which really do anything.
 - Select it, and tap on the screen and it should output all sorts of fun data about touch/release events!
   - It does multi-finger-tracking, etc.

I'm not sure yet if I'll try to like display an image and track touches on their own (as Mycroft did),  
or try to use a web browser interface and use the browser touch input.
For now, just know it works.

### Test fan
Reference: https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/hardware_tests/old_fan.py

Hardware speed range is appx 30-255.

`sudo i2cset -a -y 1 0x04 101 0 i # Stop`
`sudo i2cset -a -y 1 0x04 101 255 i # Full speed`

For some reason we always need `-a` to see 04 both with `i2cdetect` and `i2cset`

### Test sound driver and speakers
Reference:
https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/utils/init_tas5806.py
https://github.com/MycroftAI/mark-ii-hardware-testing/blob/main/utils/set_volume_tas5806.py

`i2cdump -y 1 0x2F W`

`sudo python ${HOME}/mark-ii-hardware-testing/utils/set_volume_tas5806.py 200`

### Test buttons

### Test LEDs

### Test microphone array

# Mycroft Dev Kit on OpenVoice Operating System
Getting all of the hardware to work on a bare install of Raspberry Pi OS wasn't working,
so I tried this OVOS image that runs on the Mycroft Dev Kit and everything works!

This seems to be the way it is released:
https://community.mycroft.ai/t/openvoiceos-a-bare-minimal-production-type-of-os-based-on-buildroot/4708/414?page=21

I downloaded this image:
OpenVoiceOS_rpi4_64-gui_dev-202301171328.img
on
https://drive.google.com/file/d/1PUtNXfZ5jMUlVAgyN-KXPdVdX6r51eBw/view?usp=share_link
on March 3 and installed it.

I think that you can also get the images from the links here:
https://openvoiceos.github.io/community-docs/getting_image/

Documentation for OpenVoiceOS is here:
https://openvoiceos.com/

Install image using the Raspberry Pi Imager.

I plugged into Ethernet, so it didn't ask about Wifi or network setup.

Select "No Backend"

Once it boots up, reboot right away because the first time it starts MyCroft twice, causing everything to be VERY SLOW.

Use the menu system to enable SSH.
Default credentials 'mycroft/mycroft'

Rename it:
`sudo vim /usr/lib/systemd/system/hostname.service`
Comment out existing hostnamectl command and replace it with one to name it Orac:
```
#ExecStart=/bin/sh -c "hostnamectl set-hostname OpenVoiceOS-`sed 's/://g' /sys/class/net/eth0/address | tail -c 7`"
ExecStart=/bin/sh -c "hostnamectl set-hostname Orac"
```
and reboot of course.

See if it will run Orac:
 - Install node

cd
mkdir bin
cd bin
wget https://nodejs.org/dist/v19.7.0/node-v19.7.0-linux-arm64.tar.xz
tar xvf node-v19.7.0-linux-arm64.tar.xz
rm node-v19.7.0-linux-arm64.tar.xz
ln -s node-v19.7.0-linux-arm64 node

Add this to .bashrc:
export PATH=${HOME}/bin:${HOME}/bin/node/bin:${PATH}

Exit and reconnect:
node -v

 - Copy unison over so that we can sync it

scp dotfiles/pi64/unison* mycroft@orac:./bin/

 I cannot find any way to add a new path to the pre-login connection, so link to this file from the
default /usr/bin path

sudo ln -s /home/mycroft/bin/unison /usr/bin/

Make sure that the IP address in syncOrac.sh is correct, and run:

syncOrac.sh

 - Run Orac

cd Orac/node
npm i
node server.js

 - Make it run as a "service"
npm i -g pm2

   - Systemd
     - https://www.unixsysadmin.com/systemd-user-services/
     - https://wiki.archlinux.org/title/systemd

.config/systemd/user/orac.service

```
[Unit]
Description=Orac Server
Wants=network-online.target
After=network.target network-online.target

[Service]
Type=forking
PIDFile=/home/mycroft/.pm2/pm2.pid
ExecStart=/home/mycroft/Orac/startpm2.sh

[Install]
WantedBy=multi-user.target network-online.target
```

NOTE: We did NOT ask systemd to ever restart pm2. The assumption is that pm2 is smart
enough to do that itself, but if not, we could ask it to.

systemctl --user daemon-reload # To allow systemd to see the service exists
systemctl --user status orac
systemctl --user start orac

And to make it start at boot:
systemctl enable --user orac

To see logs:
journalctl --user -f

# TODO:
 - Change the wake word
 - Have it not say "I'm mycroft" but "Orac" on boot

# Trying the 