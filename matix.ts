// Gib deinen Code hier ein
namespace matrix {

    const cx = 128 // Pixel (Bytes von links nach rechts)
    const cy = 128 // Pixel (8 Pixel pro Byte von unten nach oben); Pages (Zeilen von oben nach unten)
    let qArray: Buffer[] = []

    //% block
    export function createArray() {
        for (let y = 0; y < cy / 8; y++) { // Page 0..15
            qArray.push(Buffer.create(cx)) // Array aus 16 Buffern je 128 Byte
        }
    }

    //% block
    export function getArray() { return qArray }

    //% block
    export function getArrayElement(y: number): number[] { return qArray[y].toArray(NumberFormat.Int8LE) }

    //% block
    export function setPixel1(x: number, y: number, bit: boolean) {
        let page = Math.trunc(y / 8) // Page = y / 8
        let exp = y % 8 // Rest von Division durch 8 = Bit 0..7 im Byte
        let bu = qArray[page] // 1 Buffer von 16 aus dem Array
        let byte = bu[x] // 1 Byte von 128 aus dem Buffer
        if (bit)
            bu[x] |= (2 ** exp)
        else
            bu[x] &= ~(2 ** exp)
    }

    //% block
    export function setPixel(x: number, y: number, bit: boolean) {
        if (between(x, 0, cx - 1) && between(y, 0, cy - 1)) {
            let exp = 7 - (y & 7) // bitwise AND letze 3 Bit = 0..7 // 7-0=7 2^7=128
            if (bit)
                qArray[y >> 3][x] |= (2 ** exp) // um 3 Bit nach rechts entspricht Division durch 8
            else
                qArray[y >> 3][x] &= ~(2 ** exp)
        }
    }

    //% block
    export function getPixel(x: number, y: number) {
        return (qArray[y >> 3][x] & (2 ** (7 - (y & 7)))) != 0
    }



    // ========== group="Logik (boolean)" advanced=true

    //% group="Logik (boolean)" advanced=true
    //% block="%i0 zwischen %i1 und %i2" weight=1
    export function between(i0: number, i1: number, i2: number): boolean {
        return (i0 >= i1 && i0 <= i2)
    }

}