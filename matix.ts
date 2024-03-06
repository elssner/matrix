
//% color=#0000BF icon="\uf108" block="Matrix" weight=20
namespace matrix
/* 240306 Lutz Elßner
https://wiki.seeedstudio.com/Grove-OLED-Display-1.12-SH1107_V3.0/
https://files.seeedstudio.com/wiki/Grove-OLED-Display-1.12-(SH1107)_V3.0/res/SH1107V2.1.pdf
*/ {

    // Display (SH1107) kann nur Write und kein Read
    function i2cWriteBuffer(buf: Buffer, repeat: boolean = false) { pins.i2cWriteBuffer(0x3C, buf, repeat) }

    export const cOffset = 7 // Platz am Anfang des Buffer bevor die cx Pixel kommen
    export const cx = 128 // Pixel (Bytes von links nach rechts)
    // 6 Bytes zur Cursor Positionierung vor den Daten + 1 Byte 0x40 Display Data

    export let qArray: Buffer[] = [] // leeres Array Elemente Typ Buffer

    export enum ePages {
        //% block="128x128"
        y128 = 16,
        //% block="128x64"
        y64 = 8
    }

    enum eCONTROL { // Co Continuation bit(7); D/C# Data/Command Selection bit(6); following by six "0"s
        // CONTROL ist immer das 1. Byte im Buffer
        x00_xCom = 0x00, // im selben Buffer folgen nur Command Bytes ohne CONTROL dazwischen
        x80_1Com = 0x80, // im selben Buffer nach jedem Command ein neues CONTROL [0x00 | 0x80 | 0x40]
        x40_Data = 0x40  // im selben Buffer folgen nur Display-Data Bytes ohne CONTROL dazwischen
    }



    // ========== group="beim Start"

    //% group="beim Start"
    //% block="init Display %pPages invert %pInvert"
    //% pInvert.shadow="toggleOnOff"
    export function init(pPages: ePages, pInvert = false) {
        let bu: Buffer
        // pro Page einen Buffer(7+128) an Array anfügen (push)
        for (let page = 0; page < pPages; page++) { // Page 0..15 oder 0..7
            bu = Buffer.create(cOffset + cx)
            bu.fill(0)

            // der Anfang vom Buffer 0..6 wird initialisiert und ändert sich nicht mehr; Daten ab Offset 7..135
            // Cursor Positionierung an den Anfang jeder Page
            bu.setUint8(0, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(1, 0xB0 | page & 0x0F) // page number 0-7 B0-B7 - beim 128x128 Display 0x0F
            // x (Spalte) 7 Bit 0..127 ist immer 0
            bu.setUint8(2, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(3, 0x00) // lower start column address 0x00-0x0F 4 Bit
            bu.setUint8(4, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(5, 0x10) // upper start column address 0x10-0x17 3 Bit

            // nach 0x40 folgen die Daten
            bu.setUint8(6, eCONTROL.x40_Data) // CONTROL Byte 0x40: Display Data

            qArray.push(bu) // Array aus 8 oder 16 Buffern je 128 Byte
        }

        // Display initialisieren
        bu = Buffer.create(3)   // muss Anzahl der folgenden setUint8 entsprechen
        bu.setUint8(0, eCONTROL.x00_xCom) // CONTROL Byte 0x00: folgende Bytes (im selben Buffer) sind alle command und kein CONTROL
        bu.setUint8(1, (pInvert ? 0xA7 : 0xA6))  // Set display not inverted / A6 Normal A7 Inverse display
        bu.setUint8(2, 0xAF)  // Set display ON (0xAE sleep mode)

        i2cWriteBuffer(bu)
        control.waitMicros(100000) // 100ms Delay Recommended
    }



    // ========== group="Pixel"

    //% group="Pixel" deprecated=true
    //% block weight=4
    export function setPixel1(x: number, y: number, bit: boolean) {
        let page = Math.trunc(y / 8) // Page = y / 8
        let exp = y % 8 // Rest von Division durch 8 = Bit 0..7 im Byte
        let bu = qArray[page] // 1 Buffer von 16 aus dem Array
        let byte = bu[x] // 1 Byte von 128 aus dem Buffer
        if (bit)
            bu[cOffset + x] |= (2 ** exp)
        else
            bu[cOffset + x] &= ~(2 ** exp)
    }

    //% group="Pixel"
    //% block weight=3
    export function setPixel(x: number, y: number, bit: boolean) {
        if (between(x, 0, cx - 1) && between(y, 0, qArray.length * 8 - 1)) {
            let exp = y & 7 // bitwise AND letze 3 Bit = 0..7
            if (bit)
                qArray[y >> 3][cOffset + x] |= (2 ** exp) // um 3 Bit nach rechts entspricht Division durch 8
            else
                qArray[y >> 3][cOffset + x] &= ~(2 ** exp)
        }
    }

    //% group="Pixel"
    //% block weight=1
    export function getPixel(x: number, y: number) {
        return (qArray[y >> 3][cOffset + x] & (2 ** (y & 7))) != 0
    }



    //% group="Display"
    //% block="write Buffer || von Zeile %vonZeile bis Zeile %bisZeile"
    //% vonZeile.min=0 vonZeile.max=15 vonZeile.defl=0
    //% bisZeile.min=0 bisZeile.max=15 bisZeile.defl=15
    export function writeMatrix(vonZeile = 0, bisZeile = 15) {
        if (vonZeile > qArray.length - 1) vonZeile = qArray.length - 1
        if (bisZeile > qArray.length - 1) bisZeile = qArray.length - 1
        if (vonZeile > bisZeile) vonZeile = bisZeile

        for (let page = vonZeile; page <= bisZeile; page++) { // qArray.length ist die Anzahl der Pages 8 oder 16
            i2cWriteBuffer(qArray[page])
            //control.waitMicros(50)
        }
        control.waitMicros(50)
    }





    // ========== group="Array: Buffer[]" advanced=true

    //% group="Array: Buffer[]" advanced=true
    //% block
    export function getArray() { return qArray }


    // ========== group="Logik (boolean)" advanced=true

    //% group="Logik (boolean)" advanced=true
    //% block="%i0 zwischen %i1 und %i2"
    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }


    //% group="Text // Kommentar" advanced=true
    //% block="// %text"
    export function comment(text: string): void { }

}