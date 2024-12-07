sudo apt update
sudo apt upgrade -y
sudo apt install -y network-manager iptables nodejs npm git

sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager

sudo nmcli connection add type wifi ifname wlan0 con-name MyAP autoconnect yes ssid OpenPrinter
sudo nmcli connection modify MyAP 802-11-wireless.mode ap ipv4.method shared
sudo nmcli connection modify MyAP 802-11-wireless.band bg 802-11-wireless.channel 6
sudo nmcli connection modify MyAP 802-11-wireless-security.key-mgmt wpa-psk 802-11-wireless-security.psk "SecurePassword"
sudo nmcli connection modify MyAP ipv4.method shared
sudo nmcli connection modify MyAP ipv4.addresses 192.168.4.1/24
sudo nmcli connection modify MyAP ipv4.gateway 192.168.4.1

sudo nano /etc/NetworkManager/dnsmasq.d/captive-portal.conf
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
address=/#/192.168.4.1
sudo systemctl restart NetworkManager

sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo sh -c "iptables-save > /etc/iptables/rules.v4"

sudo npm install -g pm2
sudo pm2 start ~/captive-portal/server.js --name captive-portal
sudo pm2 save
sudo pm2 startup

sudo nmcli connection up MyAP
