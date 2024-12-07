#!/bin/bash

LED_PATH="/sys/class/leds/ACT"
WIFI_AP="MyAP"
WIFI_CLIENT="wifi-connection"

# Function to set the LED state
set_led() {
    case $1 in
        on)
            echo 1 > "$LED_PATH/brightness"
            ;;
        off)
            echo 0 > "$LED_PATH/brightness"
            ;;
    esac
}

# Disable default trigger
echo none > "$LED_PATH/trigger"

# Infinite loop to monitor Wi-Fi status
while true; do
    # Check if MyAP is active
    if nmcli -t -f NAME,TYPE con show --active | grep -q "$WIFI_AP"; then
        # Flash the LED every 2 seconds
        set_led on
        sleep 1
        set_led off
        sleep 1
    elif nmcli -t -f NAME,TYPE con show --active | grep -q "$WIFI_CLIENT"; then
        # Keep the LED solid if wifi-connection is active
        set_led on
        sleep 1
    else
        # Turn off the LED if no connection is active
        set_led off
        sleep 1
    fi
done
