import { Device, OutEndpoint, findByIds, usb } from 'usb';

const PRINTER_VENDOR_ID = 6495;
const PRINTER_PRODUCT_ID = 1;

let device: Device | undefined;
let out_endpoint: OutEndpoint | undefined;

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
    const endpoint = ifc.endpoints.find((e: any) => e.direction === 'out') as OutEndpoint | undefined
    if (!endpoint) {
        ifc.release()
        _device.close()
        console.error('Failed to get out endpoint for GODEX printer')
        return
    }
    out_endpoint = endpoint
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

export const isPrinterConnected = () => {
    if (!!device && !!out_endpoint) {
        return true
    }
    return false
}

export const sendToPrinter = async (cmd: string) => {
    return new Promise((res, rej) => {
        if (out_endpoint) {
            out_endpoint.transfer(Buffer.from(cmd, 'utf-8'), (error: any, size: any) => {
                if (error) {
                    rej(error)
                    return
                }
                res(size)
            })
        }
        rej('Printer not available.')
    })
}
