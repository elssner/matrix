// Gib deinen Code hier ein
namespace matrix {


    // ========== group="Image in Buffer zeichnen" subcategory=Bilder

    //% group="Image in Buffer zeichnen" subcategory=Bilder
    //% block="zeichne Bild %im x %xpos y %ypos || 0-Pixel löschen %del"
    //% x.min=0 x.max=119 y.min=0 y.max=55
    //% del.shadow="toggleYesNo"
    //% inlineInputMode=inline
    export function writeImageOLED(im: Image, x: number, y: number, del = false) {
        for (let iy = 0; iy <= im.height() - 1; iy++) {
            for (let ix = 0; ix <= im.width() - 1; ix++) {
                if (del) // Pixel im Buffer an und aus schalten
                    setPixel(ix + x, iy + y, im.pixel(ix, iy))
                else if ((im.pixel(ix, iy))) // Pixel nur an schalten (false lässt vorhandene Pixel unverändert)
                    setPixel(ix + x, iy + y, true)
            }
        }
    }


    // ========== subcategory=Bilder ==========



    //% group="Image Objekte" subcategory=Bilder
    //% block="Bild 8x8" weight=8
    //% imageLiteral=1 imageLiteralColumns=8 imageLiteralRows=8
    //% shim=images::createImage
    export function matrix8x8(i: string): Image {
        const im = <Image><any>i;
        return im
    }

    //% group="Image Objekte" subcategory=Bilder
    //% block="Bild 16x16" weight=7
    //% imageLiteral=1 imageLiteralColumns=16 imageLiteralRows=16
    //% shim=images::createImage
    export function matrix16x16(i: string): Image {
        const im = <Image><any>i;
        return im
    }

    //% group="Image Objekte" subcategory=Bilder
    //% block="Bild 32x32" weight=6
    //% imageLiteral=1 imageLiteralColumns=32 imageLiteralRows=32
    //% shim=images::createImage
    export function matrix32x32(i: string): Image {
        const im = <Image><any>i;
        return im
    }


}