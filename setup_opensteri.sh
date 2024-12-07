#!/bin/bash

# Update and upgrade
sudo apt update
sudo apt upgrade -y

# Install necessary packages
sudo apt install -y network-manager iptables nodejs npm git

# Enable and start NetworkManager
sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager

# Configure Wi-Fi Access Point
sudo nmcli connection add type wifi ifname wlan0 con-name MyAP autoconnect yes ssid OpenPrinter
sudo nmcli connection modify MyAP 802-11-wireless.mode ap ipv4.method shared
sudo nmcli connection modify MyAP 802-11-wireless.band bg 802-11-wireless.channel 6
sudo nmcli connection modify MyAP 802-11-wireless-security.key-mgmt wpa-psk 802-11-wireless-security.psk "opensteri123"
sudo nmcli connection modify MyAP ipv4.method shared
sudo nmcli connection modify MyAP ipv4.addresses 192.168.4.1/24
sudo nmcli connection modify MyAP ipv4.gateway 192.168.4.1

# Restart NetworkManager
sudo systemctl restart NetworkManager

# Configure iptables for port redirection
sudo mkdir -p /etc/iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

# Save iptables rules
sudo sh -c "iptables-save > /etc/iptables/rules.v4"

# Clone and set up captive-portal
git clone https://github.com/sagearora/opensteri-pi.git
cd opensteri-pi/captive-portal

sudo npm install -g pm2
npm i
sudo node server.js

# Bring up the Access Point
sudo nmcli connection up MyAP