import dayjs from "dayjs";
import { isPrinterConnected, sendCommand } from "./printServer";
import { QRType, createQr } from "./qr-service"; // Adjust or remove this if QR service isn't required

// Define the structure of a label
export interface Label {
    id: number;
    category: string;
    name: string;
    userName: string;
    createdAt: string; // ISO string
    expiryAt: string; // ISO string
}

// Printer layout constant for formatting
const printerLayout = `^Q25,3\n^W50\n^H5\n^P1\n^S2\n^AD\n^C1\n^R0\n~Q+0\n^O0\n^D0\n^E12\n~R255`;
const maxContentSize = 14; // Maximum character length for item name display

export const checkStatus = isPrinterConnected

export const printLabels = async (labels: Label[]) => {
    if (!labels.length) {
        return [];
    }

    const printCommands: string[] = [printerLayout];

    const labelsToPrint = labels.map((label) => {
        const qrCode = createQr({
            type: QRType.SteriLabel,
            id: label.id,
        });

        printCommands.push(
            `^L\nDy2-me-dd\nTh:m:s\nAA,4,9,1,1,0,0,#${label.id} - ${label.category}\n` +
            `AC,4,29,1,1,0,0,${label.name.slice(0, maxContentSize)}\n` +
            `AC,4,59,1,1,0,0,${label.name.slice(maxContentSize, maxContentSize * 2)}\n` +
            `AC,4,100,1,1,0,0,${label.userName}\n` +
            `AA,4,135,1,1,0,0,Date: ${dayjs(label.createdAt).format("YYYY-MM-DD HH:mm")}\n` +
            `AA,4,162,1,1,0,0,Exp: ${dayjs(label.expiryAt).format("YYYY-MM-DD HH:mm")}\n` +
            `W218,9,5,2,M0,8,6,${qrCode.length},0\n${qrCode}\nE\n`
        );

        return label;
    });

    // Join commands and send to printer
    const command = printCommands.join("\n");
    await sendCommand(command)
    if ((await checkStatus(true)).code === '00') {
        return labelsToPrint
    }
    console.error("Error printing labels");
    return [];
}