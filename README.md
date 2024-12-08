Here’s the updated `README.md` reflecting the use of the **BTBerryWifi** iOS app:

---

# OpenSteri RPI Print Server

Welcome to the **OpenSteri RPI Print Server**! This project uses **BTBerryWifi** for Bluetooth-based Wi-Fi configuration and includes a print server to manage printers on your Raspberry Pi.

## Features

- Configure Wi-Fi credentials via the **BTBerryWifi** iOS app.
- Automatically set up and start a print server using Node.js.
- Redirect HTTP traffic to the print server using iptables.
- Fully automated installation script for Raspberry Pi.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- A Raspberry Pi (preferably Raspberry Pi Zero or newer).
- A fresh Raspberry Pi OS installation (Lite or Desktop).
- Access to the Raspberry Pi via SSH or a physical terminal.
- An active internet connection.
- An iOS device with the **BTBerryWifi** app installed (see below).

---

### Installation

1. Flash the Raspberry Pi OS onto your SD card.
2. Boot your Raspberry Pi and connect to it via SSH or terminal.
3. Run the following command to download and execute the setup script:

```bash
curl https://raw.githubusercontent.com/sagearora/opensteri-pi/refs/heads/main/setup_opensteri.sh | bash
```

This script will:
- Install and configure **BTBerryWifi** for Bluetooth Wi-Fi setup.
- Update and upgrade the system.
- Install all necessary dependencies (Node.js, Bluetooth utilities, etc.).
- Clone the OpenSteri repository to the Raspberry Pi.
- Start the print server and ensure it runs on boot.

---

### Usage

#### Bluetooth Wi-Fi Setup with BTBerryWifi

1. Download the **BTBerryWifi** iOS app:
   - [BTBerryWifi on the App Store](https://apps.apple.com/us/app/btberrywifi/id1596978011).
2. Pair your iOS device with the Raspberry Pi via Bluetooth.
3. Open the **BTBerryWifi** app on your iOS device.
4. Enter your Wi-Fi credentials (SSID and Password) in the app and connect to the Raspberry Pi.
5. The Raspberry Pi will use these credentials to connect to the specified Wi-Fi network and save them for future use.

For more details on **BTBerryWifi**, visit [BTBerryWifi Overview](https://normfrenette.com/Set-wifi-via-bluetooth/BTBerryWifi-Overview/#sectionTop).

---

#### Print Server

Once the installation is complete, the print server will be running on port `8080`. You can access it using the Raspberry Pi's IP address:

```
http://<raspberry-pi-ip/hostname>:8080
```

---

### Development

To contribute or modify this project:

1. Clone the repository:
   ```bash
   git clone https://github.com/sagearora/opensteri-pi.git
   ```
2. Navigate to the project directory:
   ```bash
   cd opensteri-pi
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

### Troubleshooting

- **BTBerryWifi not working**:
  Ensure the Bluetooth service is running:
  ```bash
  sudo systemctl start bluetooth
  ```

- **Wi-Fi not connecting**:
  Check the configuration in `/etc/wpa_supplicant/wpa_supplicant.conf`.

- **Print server not running**:
  Verify the PM2 process:
  ```bash
  pm2 list
  ```

---

### Roadmap

- Add support for more printer models.
- Develop a web-based dashboard for managing the print server.
- Explore advanced printer error reporting and monitoring features.

---

### License

This project is licensed under the [MIT License](LICENSE).

---

### Acknowledgements

Special thanks to **BTBerryWifi** for simplifying Bluetooth-based Wi-Fi configuration and to all contributors and the open-source community for making this project possible.

---

This README now reflects the **BTBerryWifi** app's availability exclusively on iOS. Let me know if further refinements are needed!