input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.showNumber(matrix.getArray().length)
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    x = 2
    y = 0
    matrix.setPixel(x, y, true)
    basic.showNumber(matrix.getArrayElement(Math.trunc(y / 8))[x])
    if (matrix.getPixel(x, y)) {
        basic.setLedColor(0x00ff00)
    } else {
        basic.setLedColor(0xff0000)
    }
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    basic.showNumber(matrix.getArrayElement(0).length)
})
let y = 0
let x = 0
matrix.createArray()
