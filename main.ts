input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    matrix.setPixel(127, 63, true)
    matrix.writeMatrix()
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    x = 2
    y = 0
    matrix.setPixel(x, y, true)
    if (matrix.getPixel(x, y)) {
        basic.setLedColor(0x00ff00)
    } else {
        basic.setLedColor(0xff0000)
    }
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    matrix.setPixel(127, 63, false)
    matrix.writeMatrix()
})
let y = 0
let x = 0
matrix.init(matrix.ePages.y128, false)
