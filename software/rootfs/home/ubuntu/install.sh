if [[ $EUID -ne 0 ]]
then
    echo "This script must be run as root."
else
    echo "Updating apt . . ."
    apt-get update
    apt-get -y upgrade

    echo "Instaling NodeJS . . . "
    apt-get -y install build-essential
    cd /home/ubuntu/node-v0.8.16
    make clean all
    make install
    apt-get -y install npm nodejs-dev
    npm install -g nodemon

    echo "Installing Mjpg-streamer . . . "
    apt-get -y install libv4l-dev libjpeg8-dev imagemagick
    cd /home/ubuntu/mjpg-streamer
    make USE_LIBV4L2=true clean all
    make DESTDIR=/usr install

    echo "Done.  Reboot your BeagleBone."
fi
