
//% color=#0000BF icon="\uf108" block="Matrix" weight=20
namespace matrix {

    const cI2CADDR = 0x3C // 0x3D

     enum eCONTROL { // Co Continuation bit(7); D/C# Data/Command Selection bit(6); following by six "0"s
        // CONTROL ist immer das 1. Byte im Buffer
        x00_xCom = 0x00, // im selben Buffer folgen nur Command Bytes ohne CONTROL dazwischen
        x80_1Com = 0x80, // im selben Buffer nach jedem Command ein neues CONTROL [0x00 | 0x80 | 0x40]
        x40_Data = 0x40  // im selben Buffer folgen nur Display-Data Bytes ohne CONTROL dazwischen
    }



    // ========== group="Display"

    //% group="Display"
    //% block
     function writeMatrix() {
        let bu: Buffer
        for (let page = 0; page < qArray.length; page++) { // qArray.length ist die Anzahl der Pages 8 oder 16
            bu = qArray[page]

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

            i2cWriteBuffer(bu)
            control.waitMicros(50)
        }

    }

    /* 
        //% group="Display"
        //% block="Display löschen || von Zeile %vonZeile bis Zeile %bisZeile mit Bitmuster %charcode" weight=2
        //% vonZeile.min=0 vonZeile.max=15 vonZeile.defl=0
        //% bisZeile.min=0 bisZeile.max=15 bisZeile.defl=15
        //% charcode.min=0 charcode.max=255 charcode.defl=0
        //% inlineInputMode=inline
        export function clearScreen(vonZeile?: number, bisZeile?: number, charcode?: number) {
            if (between(vonZeile, 0, cPages - 1) && between(bisZeile, 0, cPages - 1)) {
                let bu = Buffer.create(cOffset + cx) // 7+128=135
                let offset = setCursorBuffer6(bu, 0, 0, 0)
                bu.setUint8(offset++, eCONTROL.x40_Data) // CONTROL+DisplayData
                bu.fill(charcode & 0xFF, offset++, cx)   // 128 Byte füllen eine Zeile pixelweise
    
                for (let page = vonZeile; page <= bisZeile; page++) {
                    bu.setUint8(1, 0xB0 | page) // an offset=1 steht die page number (Zeile 0-7)
                    // sendet den selben Buffer 8 Mal mit Änderung an 1 Byte
                    // true gibt den i2c Bus dazwischen nicht für andere Geräte frei
                    i2cWriteBuffer(bu, page < bisZeile) // Clear Screen
                }
                control.waitMicros(100000) // 100ms Delay Recommended
            }
        }
    
        function setCursorBuffer6(bu: Buffer, offset: number, row: number, col: number) {
            // schreibt in den Buffer ab offset 6 Byte (CONTROL und Command für setCursor)
            // Buffer muss vorher die richtige Länge haben
            bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(offset++, 0xB0 | row & 0x0F)      // page number 0-7 B0-B7 - beim 128x128 Display 0x0F
            bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(offset++, 0x00 | col << 3 & 0x0F) // (col % 16) lower start column address 0x00-0x0F 4 Bit
            bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
            bu.setUint8(offset++, 0x10 | col >> 1 & 0x07) // (col >> 4) upper start column address 0x10-0x17 3 Bit
            return offset
            //                    0x40               // CONTROL+Display Data
        }
     */

    //% group="Display Command" advanced=true
    //% block
     function init16(pInvert = false) {
        let bu = Buffer.create(3)   // muss Anzahl der folgenden setUint8 entsprechen
        let offset = 0               // Buffer offset (offset++ liest erst den Wert und erhöht ihn dann)

        bu.setUint8(offset++, eCONTROL.x00_xCom) // CONTROL Byte 0x00: folgende Bytes (im selben Buffer) sind alle command und kein CONTROL

        //bu.setUint8(offset++, 0xAE)  // Set display OFF

        //bu.setUint8(offset++, 0x20) // 0x20 Horizontal Addressing Mode

        //bu.setUint8(offset++, 0x81)  // Set Contrast (Helligkeit)
        //bu.setUint8(offset++, 0xCF)  //     Contrast default 0x7F

        //bu.setUint8(offset++, 0xA4)  // Set all pixels OFF

        bu.setUint8(offset++, (pInvert ? 0xA7 : 0xA6))  // Set display not inverted / A6 Normal A7 Inverse display

        bu.setUint8(offset++, 0xAF)  // Set display ON (0xAE sleep mode)

        i2cWriteBuffer(bu)
        control.waitMicros(100000) // 100ms Delay Recommended
    }

    // ========== group="Display Command" advanced=true

    //% group="Display Command" advanced=true
    //% block="Display initialisieren || invert %pInvert drehen %pFlip" weight=8
    //% pInvert.shadow="toggleOnOff" pInvert.defl=false
    //% pFlip.shadow="toggleOnOff" pFlip.defl=false
     function init(pInvert?: boolean, pFlip?: boolean): void {

        // Vcc Generated by Internal DC/DC Circuit
        const vccext = false

        let bu = Buffer.create(23)   // muss Anzahl der folgenden setUint8 entsprechen
        let offset = 0               // Buffer offset (offset++ liest erst den Wert und erhöht ihn dann)

        bu.setUint8(offset++, eCONTROL.x00_xCom) // CONTROL Byte 0x00: folgende Bytes (im selben Buffer) sind alle command und kein CONTROL
        // CONTROL Byte 0x80: ignoriert 2. command-Byte (0xD5) und wertet es als CONTROL
        // CONTROL Byte 0x80: nach jedem command muss (im selben Buffer) wieder ein CONTROL 0x80 vor dem nächsten command kommen
        // CONTROL Byte 0x80: wenn ein CONTROL 0x40 folgt, können (im selben Buffer) auch Display-Daten GDDRAM folgen


        // https://cdn-shop.adafruit.com/datasheets/UG-2864HSWEG01.pdf (Seite 15, 20 im pdf)

        bu.setUint8(offset++, 0xAE)  // Set display OFF

        bu.setUint8(offset++, 0xD5)  // Set Display Clock Divide Ratio / OSC Frequency
        bu.setUint8(offset++, 0x80)  //     default 0x80

        bu.setUint8(offset++, 0xA8)  // Set Multiplex Ratio
        bu.setUint8(offset++, 0x3F)  //     Multiplex Ratio for 128x64 (64-1)

        bu.setUint8(offset++, 0xD3)  // Set Display Offset
        bu.setUint8(offset++, 0x00)  //     Display Offset

        bu.setUint8(offset++, 0x40)  // Set Display Start Line

        bu.setUint8(offset++, 0x8D)  // Set Charge Pump
        //bu.setUint8(offset++, 0x14)  //     Charge Pump (0x10 Disable; 0x14 7,5V; 0x94 8,5V; 0x95 9,0V)
        bu.setUint8(offset++, (vccext ? 0x10 : 0x14))

        //bu.setUint8(offset++, 0xA1)  // Set Segment Re-Map default 0xA0
        bu.setUint8(offset++, (!pFlip ? 0xA1 : 0xA0))

        //bu.setUint8(offset++, 0xC8)  // Set Com Output Scan Direction default 0xC0
        bu.setUint8(offset++, (!pFlip ? 0xC8 : 0xC0))

        bu.setUint8(offset++, 0xDA)  // Set COM Hardware Configuration
        bu.setUint8(offset++, 0x12)  //     COM Hardware Configuration

        bu.setUint8(offset++, 0x81)  // Set Contrast (Helligkeit)
        //bu.setUint8(offset++, 0xCF)  //     Contrast default 0x7F
        bu.setUint8(offset++, (vccext ? 0x9F : 0xCF))

        bu.setUint8(offset++, 0xD9)  // Set Pre-Charge Period
        //bu.setUint8(offset++, 0xF1)  //     Pre-Charge Period (0x22 External, 0xF1 Internal)
        bu.setUint8(offset++, (vccext ? 0x22 : 0xF1))

        bu.setUint8(offset++, 0xDB)  // Set VCOMH Deselect Level
        bu.setUint8(offset++, 0x40)  //     VCOMH Deselect Level default 0x20

        bu.setUint8(offset++, 0xA4)  // Set all pixels OFF

        bu.setUint8(offset++, (pInvert ? 0xA7 : 0xA6))  // Set display not inverted / A6 Normal A7 Inverse display

        //bu.setUint8(offset++, 0xAF)  // Set display ON

        i2cWriteBuffer(bu) // nur 1 Buffer wird gesendet


        bu = Buffer.create(135)
        offset = 0            //offset = setCursorBuffer6(bu, 0, 0, 0)

        bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
        bu.setUint8(offset++, 0xB0)// | (page & 0x07)) // page number

        bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
        bu.setUint8(offset++, 0x00)// | (col & 0x0F)) // lower start column address 0x00-0x0F 4 Bit

        bu.setUint8(offset++, eCONTROL.x80_1Com) // CONTROL+1Command
        bu.setUint8(offset++, 0x10)// | (col >> 4) & 0x07) // upper start column address 0x10-0x17 3 Bit

        bu.setUint8(offset++, eCONTROL.x40_Data) // CONTROL+DisplayData
        bu.fill(0x00, offset++, 128)

        for (let page = 0; page <= 7; page++) {
            bu.setUint8(1, 0xB0 | page) // an offset=1 steht die page number (Zeile 0-7)
            // sendet den selben Buffer 8 Mal mit Änderung an 1 Byte
            // true gibt den i2c Bus dazwischen nicht für andere Geräte frei
            i2cWriteBuffer(bu, true) // Clear Screen
        }

        // Set display ON
        bu = Buffer.create(2)
        bu.setUint8(0, eCONTROL.x80_1Com) // CONTROL+1Command
        bu.setUint8(1, 0xAF) // Set display ON
        i2cWriteBuffer(bu)

        control.waitMicros(100000) // 100ms Delay Recommended
    }



    // ======== private

    function i2cWriteBuffer(buf: Buffer, repeat: boolean = false) {
        pins.i2cWriteBuffer(cI2CADDR, buf, repeat)
    }

}