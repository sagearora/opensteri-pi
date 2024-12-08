import { Device, InEndpoint, OutEndpoint, findByIds, usb } from 'usb';

const PRINTER_VENDOR_ID = 6495;
const PRINTER_PRODUCT_ID = 1;

let device: Device | undefined;
let out_endpoint: OutEndpoint | undefined;
let in_endpoint: InEndpoint | undefined;

const initDevice = (_device: Device) => {
    console.log('Init GODEX printer')
    _device.open()
    const ifc = _device.interface(0)
    if (ifc.isKernelDriverActive()) {
        try {
            ifc.detachKernelDriver()
        } catch (e) {
            console.error('Error detaching kernel driver', e)
            _device.close()
            return
        }
    }
    ifc.claim()
    const outEndpoint = ifc.endpoints.find((e: any) => e.direction === 'out') as OutEndpoint | undefined
    const inEndpoint = ifc.endpoints.find((endpoint) => endpoint.direction === "in") as InEndpoint | undefined;
    if (!outEndpoint) {
        console.error('Failed to get out endpoint for GODEX printer')
    }
    if (!inEndpoint) {
        console.error("No IN endpoint found.");
    }

    if (!outEndpoint && !inEndpoint) {
        ifc.release()
        _device.close()
    }

    out_endpoint = outEndpoint
    in_endpoint = inEndpoint
    device = _device
}


usb.on('attach', (d: Device) => {
    if (d.deviceDescriptor.idVendor === PRINTER_VENDOR_ID && d.deviceDescriptor.idProduct === PRINTER_PRODUCT_ID) {
        initDevice(d)
    }
})

usb.on('detach', () => {
    const _device = findByIds(PRINTER_VENDOR_ID, PRINTER_PRODUCT_ID)
    if (!_device) {
        device = undefined
        out_endpoint = undefined
    }
})

const connected = findByIds(PRINTER_VENDOR_ID, PRINTER_PRODUCT_ID)
if (connected) {
    initDevice(connected)
}

let last_status: string|undefined;

const statusDescriptions: Record<string, string> = {
    "00": "Printer is ready.",
    "01": "Media empty or media jam detected.",
    "02": "Media empty or media jam detected.",
    "03": "Ribbon is empty.",
    "04": "Printhead is open.",
    "05": "Rewinder is full.",
    "06": "File system is full.",
    "07": "Filename not found.",
    "08": "Duplicate name error.",
    "09": "Syntax error in command.",
    "10": "Cutter jam detected.",
    "11": "Extended memory not found.",
    "20": "Printer is paused.",
    "21": "Printer is in setting mode.",
    "22": "Printer is in keyboard mode.",
    "50": "Printer is currently printing.",
    "60": "Data is being processed."
};

/**
 * Converts a printer status code to a human-readable message.
 * @param statusCode - The status code received from the printer.
 * @returns Human-readable status message.
 */
const getStatusMessage = (statusCode: string): string => {
    return statusDescriptions[statusCode] || "Unknown status code.";
};

export const sendCommand = (command: string) => {
    return new Promise((res, rej) => {
        if (!out_endpoint) {
            console.error('OutEndpoint not initialized');
            rej('Printer connection output error.')
            return;
        }

        const buffer = Buffer.from(command, 'utf-8');
        out_endpoint.transfer(buffer, (err) => {
            if (err) {
                console.error('Error sending command:', err);
                rej(err)
            } else {
                console.log('Command sent:', command);
                res(true)
            }
        });
    })

};

const readStatus = async () => {
    return new Promise<{code: string; message: string}>((res, rej) => {
        if (!in_endpoint) {
            console.error('InEndpoint not initialized');
            rej('Printer connection input error.')
            return;
        }

        in_endpoint.transfer(512, (err, data: any) => {
            if (err) {
                console.error('Error reading status:', err);
                rej(err)
            } else {
                const code = data.toString().substring(0, 2)
                const message = getStatusMessage(code)
                res({
                    code,
                    message,
                })
            }
        });
    })
};


export const isPrinterConnected = async (force_check?: boolean) => {
    if (last_status === '00' && !force_check){
        return {
            code: last_status,
            message: getStatusMessage(last_status),
        }
    }
    // Enable immediate response mode
    await sendCommand('^XSET,IMMEDIATE,1\n');

    // Query printer status
    await sendCommand('~S,CHECK\n');
    const result = await readStatus();
    last_status = result.code
    return result
}
