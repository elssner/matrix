input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    basic.showNumber(matrix.getArray().length)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    basic.showNumber(matrix.getArrayElement(0).length)
})
matrix.createArray()
