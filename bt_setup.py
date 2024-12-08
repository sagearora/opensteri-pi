import os
from bluetooth import BluetoothSocket, RFCOMM, advertise_service

def configure_wifi(ssid: str, password: str):
    """Write Wi-Fi credentials to wpa_supplicant.conf and restart Wi-Fi."""
    wpa_supplicant_conf = "/etc/wpa_supplicant/wpa_supplicant.conf"
    wifi_config = f"""
network={{
    ssid="{ssid}"
    psk="{password}"
}}
"""
    with open(wpa_supplicant_conf, "a") as file:
        file.write(wifi_config)

    os.system("sudo wpa_cli -i wlan0 reconfigure")
    print(f"Configured Wi-Fi for SSID: {ssid}")


SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB"  # Serial Port Profile UUID

def handle_bluetooth_connection():
    """Set up a Bluetooth socket and handle incoming connections."""
    server_sock = BluetoothSocket(RFCOMM)
    server_sock.bind(("", 1))
    server_sock.listen(1)

    advertise_service(
        server_sock,
        "WiFiSetupService",
        service_id=SPP_UUID,
        service_classes=[SPP_UUID],  # Valid UUID for the service
        profiles=[RFCOMM]
    )

    print("Waiting for Bluetooth connection...")
    client_sock, client_info = server_sock.accept()
    print(f"Accepted connection from {client_info}")

    try:
        while True:
            data = client_sock.recv(1024).decode("utf-8").strip()
            if not data:
                break

            print(f"Received data: {data}")
            if data.startswith("WIFI:"):
                # Extract SSID and password from the message
                _, ssid, password = data.split(",")
                configure_wifi(ssid, password)
                client_sock.send("Wi-Fi configured!\n")
                break
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client_sock.close()
        server_sock.close()
        
if __name__ == "__main__":
    handle_bluetooth_connection()
