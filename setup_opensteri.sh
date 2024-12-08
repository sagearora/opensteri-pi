#!/bin/bash
#
# opensteri service installer
#

# Exit on errors
set -e

# Update and upgrade
echo "Updating and upgrading the system..."
sudo apt update
sudo apt upgrade -y

# Install necessary packages
echo "Installing required packages..."
sudo apt install -y network-manager iptables nodejs npm

GIT_REPO="https://github.com/sagearora/opensteri-pi.git"
INSTALL_DIR="/home/pi/opensteri-pi"

if [ ! -d "$INSTALL_DIR" ]; then
    echo "Cloning repository from $GIT_REPO..."
    git clone $GIT_REPO $INSTALL_DIR
else
    echo "Repository already exists. Pulling latest changes..."
    cd $INSTALL_DIR
    git pull
fi

# Configure Wi-Fi Access Point
echo "Install Bluetooth Utility For Wifi"
curl  https://raw.githubusercontent.com/nksan/Rpi-SetWiFi-viaBluetooth/main/btwifisetInstall.sh | bash

# Configure iptables for port redirection
echo "Setting up iptables for port redirection..."
sudo mkdir -p /etc/iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

# Save iptables rules
echo "Saving iptables rules..."
sudo sh -c "iptables-save > /etc/iptables/rules.v4"

echo "Setting up the Print Server..."
cd "$INSTALL_DIR/printer"
sudo npm run build
sudo npm install -g pm2
sudo pm2 start dist/server.js --name opensteri-print-server
sudo pm2 save
sudo pm2 startup

echo "Setup complete. Your Raspberry Pi is now a BT Access Point with print server."
sudo reboot
