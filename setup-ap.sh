sudo apt update
sudo apt upgrade -y
sudo apt install -y network-manager iptables nodejs npm git

sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager

sudo nmcli connection add type wifi ifname wlan0 con-name MyAP autoconnect yes ssid OpenPrinter
sudo nmcli connection modify MyAP 802-11-wireless.mode ap ipv4.method shared
sudo nmcli connection modify MyAP 802-11-wireless.band bg 802-11-wireless.channel 6
sudo nmcli connection modify MyAP 802-11-wireless-security.key-mgmt wpa-psk 802-11-wireless-security.psk "opensteri123"
sudo nmcli connection modify MyAP ipv4.method shared
sudo nmcli connection modify MyAP ipv4.addresses 192.168.4.1/24
sudo nmcli connection modify MyAP ipv4.gateway 192.168.4.1

sudo systemctl restart NetworkManager

sudo mkdir /etc/iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables --wait --table nat --append OUTPUT --protocol tcp --dport 80 --jump REDIRECT --to-port 8080

sudo sh -c "iptables-save > /etc/iptables/rules.v4"

# Install all npm packages and build captive-portal
git clone https://github.com/sagearora/opensteri-pi.git
cd opensteri-pi/captive-portal

sudo npm install -g pm2
npm i
sudo node server.js

sudo nmcli connection up MyAP
