Beaglebone Robot
================
&copy; Ansync, Inc. 2012, 2013
[https://ansync.com](https://ansync.com)
[support@ansync.com](mailto:support@ansync.com)

This software package provides all essential control software and utilities to
control the Beaglebone-powered robot as seen on [Youtube](http://youtu.be/6dFpoP_fFSo).

Installation
------------
This package uses Ubuntu 12.10 (Quantal) as its base.  Download the distribution
package [here](http://rcn-ee.net/deb/rootfs/quantal/ubuntu-12.10-r2-minimal-armhf-2012-11-29.tar.xz).
Helpful instructions [here](http://embeddedprogrammer.blogspot.com/2012/10/beaglebone-installing-ubuntu-1210.html).

Setup the Beaglebone as you wish, but remember that **This software assumes the
presence of a user named "ubuntu" with sudo privileges.**

Once installed, extract rootfs.tar.bz2 to the root of your SD card.  Then login
to your Beaglebone and run /home/ubuntu/install.sh as root.

Finally, update /etc/network/interfaces to setup the Beaglebone's IP and
preferred wifi AP.  A sample AP is set up already.  By default the
Beaglebone will get a static IP of 192.168.1.22.

The control software should run at boot.  Connect to
http://(Beaglebone IP):2000/robot1 to start driving!

Contents
--------
This software adds the following:
* NodeJS version 0.8.16
* Mjpg-streamer version 2.0
* Upstart scripts for the control software and webcam streaming
* Robot control software
* Networking config files to set static IP/associate with wifi
