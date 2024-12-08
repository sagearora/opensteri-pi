#!/bin/bash

# Exit on errors
set -e

# Update and upgrade
echo "Updating and upgrading the system..."
sudo apt update
sudo apt upgrade -y

# Install necessary packages
echo "Installing required packages..."
sudo apt install -y network-manager iptables nodejs npm

# Enable and start NetworkManager
echo "Enabling NetworkManager..."
sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager

# Configure Wi-Fi Access Point
echo "Configuring Wi-Fi Access Point..."
sudo nmcli connection add type wifi ifname wlan0 con-name MyAP autoconnect yes ssid OpenPrinter
sudo nmcli connection modify MyAP 802-11-wireless.mode ap ipv4.method shared
sudo nmcli connection modify MyAP 802-11-wireless.band bg 802-11-wireless.channel 6
sudo nmcli connection modify MyAP 802-11-wireless-security.key-mgmt wpa-psk 802-11-wireless-security.psk "opensteri123"
sudo nmcli connection modify MyAP ipv4.method shared
sudo nmcli connection modify MyAP ipv4.addresses 192.168.4.1/24
sudo nmcli connection modify MyAP ipv4.gateway 192.168.4.1

# Copy and configure LED status script
echo "Setting up Wi-Fi LED status script..."
sudo cp ./wifi-led-status.sh /usr/local/bin
sudo chmod +x /usr/local/bin/wifi-led-status.sh

# Configure LED status service
echo "Configuring LED status systemd service..."
SERVICE_FILE="/etc/systemd/system/wifi-led-status.service"
sudo tee $SERVICE_FILE > /dev/null <<EOL
[Unit]
Description=Wi-Fi LED Status Indicator
After=network.target

[Service]
ExecStart=/usr/local/bin/wifi-led-status.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable wifi-led-status.service
sudo systemctl start wifi-led-status.service

# Restart NetworkManager
echo "Restarting NetworkManager..."
sudo systemctl restart NetworkManager

# Configure iptables for port redirection
echo "Setting up iptables for port redirection..."
sudo mkdir -p /etc/iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

# Save iptables rules
echo "Saving iptables rules..."
sudo sh -c "iptables-save > /etc/iptables/rules.v4"

sudo npm install -g pm2
echo "Setting up the captive portal..."
cd captive-portal
npm run build
sudo pm2 start server.js --name captive-portal
echo "Setting up the Print Server..."
cd ../printer
npm run build
sudo pm2 start dist/server.js --name print-server
sudo pm2 save
sudo pm2 startup

# Bring up the Access Point
echo "Bringing up the Access Point..."
sudo nmcli connection up MyAP

echo "Setup complete. Your Raspberry Pi is now a Wi-Fi Access Point with a captive portal && print server."
