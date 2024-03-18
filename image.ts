// Gib deinen Code hier ein
namespace matrix {



    // ========== subcategory=Bilder ==========



    //% group="Matrix" subcategory=Bilder
    //% block="Bild 8x8" weight=4
    //% imageLiteral=1 imageLiteralColumns=8 imageLiteralRows=8
    //% shim=images::createImage
    export function matrix8x8(i: string): Image {
        const im = <Image><any>i;
        return im
    }

    //% group="Matrix" subcategory=Bilder
    //% block="Bild 16x16" weight=2
    //% imageLiteral=1 imageLiteralColumns=16 imageLiteralRows=16
    //% shim=images::createImage
    export function matrix16x16(i: string): Image {
        const im = <Image><any>i;
        return im
    }


    // ========== group="Image in Buffer zeichnen" subcategory=Bilder

    //% group="Image in Buffer zeichnen" subcategory=Bilder
    //% block="zeichne Matrix %im x %xpos y %ypos" weight=8
    //% xpos.min=0 xpos.max=119 ypos.min=0 ypos.max=55
    export function writeImageOLED(im: Image, xpos: number, ypos: number) {
        for (let y = 0; y <= im.height() - 1; y++) {
            for (let x = 0; x <= im.width() - 1; x++) {
                if ((im.pixel(x, y) ? 1 : 0)) {
                    setPixel(x + xpos, y + ypos, true)
                }
            }
        }
    }

}