import base64 from 'base-64'

export const QRPrefix = 'zs/';

export enum QRType {
    SteriLabel = 1
}

export const createQr = (data: any) => {
    return `${QRPrefix}${base64.encode(JSON.stringify(data))}`
}

export const resolveQr = (data: string): any | undefined => {
    try {
        if (data.startsWith(QRPrefix)) {
            const json = base64.decode(data.slice(QRPrefix.length))
            return JSON.parse(json)
        }
    } catch (e) {
        return undefined
    }
}