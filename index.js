'use strict'
const http = require('http')
const express = require('express')
const path = require('path')
const five = require('johnny-five')
const EventEmitter = require('events').EventEmitter

const cmds = new EventEmitter()

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

const server = http.createServer(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log(`Se conectó ${socket.id}`)

  socket.on('led:on', () => {
    cmds.emit('led:on')
  })

  socket.on('led:off', () => {
    cmds.emit('led:off')
  })

  cmds.on('temperature', (temperature) => {
     socket.emit('temperature', temperature)
  })
})

const board = new five.Board()
board.on('ready', () => {
   const led = new five.Led(13)
   const temp = new five.Sensor('A0')

   cmds.on('led:on', () => {
     led.on()
   })

   cmds.on('led:off', () => {
     led.off()
   })

   temp.on('data', function() {
   	let temperature = getTemperature(this.value)
    cmds.emit('temperature', temperature.celsius)
   })
})

function getTemperature(value) {

  // LM35
  var celsius = (5 * value * 100) / 1024;

  var fahrenheit = celsius * (9 / 5) + 32;

  return {
    celsius: celsius,
    fahrenheit: fahrenheit
  }
}

server.listen(8080, () => console.log("Listening"))
