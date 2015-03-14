# Introduction #

This guide will walk through the installation and operation of the Beaglebot control software on the [BeagleBone](http://beagleboard.org/static/beaglebone/latest/README.htm).  This guide assumes the BeagleBone is connected to the USB hub and wifi dongle as listed in the [BOM](http://ansync-beaglebone.googlecode.com/git/bom.pdf).

These instructions are for Linux.

## 1. Installing Ubuntu ##

We'll be using Ubuntu 12.10 (Quantal) as the base.  Download the distribution package here:

[ubuntu-12.10-r2-minimal-armhf-2012-11-29.tar.xz](http://rcn-ee.net/deb/rootfs/quantal/ubuntu-12.10-r2-minimal-armhf-2012-11-29.tar.xz)

Follow the instructions [here](http://elinux.org/BeagleBoardUbuntu#Quantal_12.10_armhf) to install Ubuntu.

Once the install completes, your SD card will have two partitions: **boot** and **rootfs**.  We'll install the software to **rootfs**.

## 2. Installing Control Software ##

Download the control software:

[rootfs-1.0.0.tar.bz2](http://code.google.com/p/ansync-beaglebone/downloads/detail?name=rootfs-1.0.0.tar.bz2)

Extract to the root of the rootfs partition.  The contents of the archive should merge with /etc and /home.

Use your favorite editor to open /etc/network/interfaces on the SD card.
Starting at line 11, edit the file with the details of your network:

```
auto wlan0
iface wlan0 inet static
    address 192.168.1.22
    netmask 255.255.255.0
    gateway 192.168.1.254
    broadcast 192.168.1.255
    wpa-ssid "<SSID>"
    wpa-psk  "<WPA KEY>"
```

Fill in your router's SSID and WPA key.  E.g., for a router with an SSID of Ansync and key of Ansync\_key:

```
    wpa-ssid "Ansync"
    wpa-psk  "Ansync_key"
```

## 3. Done ##

That's it!  Insert your SD card into the BeagleBone and power on.  Once the BeagleBone powers on, it should automatically connect to wifi using the IP you set.  SSH and the control software are available at boot.

Assuming an IP of 192.168.1.22, you can connect to the control software at [http://192.168.1.22:2000/robot1/](http://192.168.1.22:2000/robot1/)