function waitForResponse(str: string) {
    time = input.runningTime()
    while (true) {
        serial_str = "" + serial_str + serial.readString()
        if (serial_str.length > 200) {
            serial_str = serial_str.substr(serial_str.length - 200)
        }
        if (serial_str.includes(str)) {
            result = true
            break;
        }
        // Shorter timeout for quicker response
        if (input.runningTime() - time > 30000) {
            break;
        }
    }
    return result
}

function getHTML(normal: boolean) {
    web_title = "ESP8266 (ESP-01) Wifi on BBC micro:bit"
    html = "" + html + "HTTP/1.1 200 OK\r\n"
    html = "" + html + "Content-Type: text/html\r\n"
    html = "" + html + "Connection: close\r\n\r\n"
    html = "" + html + "<!DOCTYPE html>"
    html = "" + html + "<html>"
    html = "" + html + "<head>"
    html = "" + html + "<link rel=\"icon\" href=\"data:,\">"
    html = "" + html + "<title>" + web_title + "</title>"
    html = "" + html + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
    html = "" + html + "</head>"
    html = "" + html + "<body>"
    html = "" + html + "<div style=\"text-align:center\">"
    html = "" + html + "<h1>" + web_title + "</h1>"
    html = "" + html + "<br>"
    if (normal) {
        if (LED_status) {
            LED_statusString = "ON"
            LED_buttonString = "TURN IT OFF"
        } else {
            LED_statusString = "OFF"
            LED_buttonString = "TURN IT ON"
        }
        html = "" + html + "<h3>LED STATUS: " + LED_statusString + "</h3>"
        html = "" + html + "<h3>Light Level STATUS: " + input.lightLevel().toString() + "</h3>"
        html = "" + html + "<h3>Temp STATUS: " + input.temperature().toString() + "</h3>"
        html = "" + html + "<h3>Distance: " + current_distance.toString() + " cm</h3>"
        html = "" + html + "<h3>Obstacle Status: " + (obstacle_detected ? "DETECTED" : "CLEAR") + "</h3>"
        html = "" + html + "<br>"
        html = "" + html + "<input type=\"button\" onClick=\"window.location.href='LED'\" value=\"" + LED_buttonString + "\">"
        html = "" + html + "<br>"
    } else {
        html = "" + html + "<h3>ERROR: REQUEST NOT FOUND</h3>"
    }
    html = "" + html + "<br>"
    html = "" + html + "<input type=\"button\" onClick=\"window.location.href='/'\" value=\"Home\">"
    html = "" + html + "</div>"
    html = "" + html + "</body>"
    html = "" + html + "</html>"
    return html
}

// Function to check for obstacles and stop if detected
function checkObstacle() {
    current_distance = maqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14)
    
    if (current_distance < OBSTACLE_THRESHOLD && current_distance > 0) {
        if (!obstacle_detected) {
            // Obstacle just detected - stop all motors
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 0)
            obstacle_detected = true
            basic.showIcon(IconNames.No) // Show X icon when obstacle detected
            music.playTone(523, music.beat(BeatFraction.Quarter)) // Warning beep
        }
    } else {
        if (obstacle_detected) {
            // Obstacle cleared
            obstacle_detected = false
            basic.showIcon(IconNames.Yes) // Show checkmark when clear
        }
    }
}

let LED_buttonString = ""
let LED_statusString = ""
let html = ""
let web_title = ""
let result = false
let time = 0
let HTTP_pos = 0
let GET_pos = 0
let serial_str = ""
let incoming = ""
let HTML_str = ""
let GET_command = ""
let client_ID = ""
let GET_success: boolean = false
// false means LEDs are off
let rainbow_led_status: boolean = false
// 0 for off, 1 for on
let LED_status: number = 0
let WIFI_MODE = 2

// Ultrasonic sensor variables
let current_distance = 0
let obstacle_detected = false
const OBSTACLE_THRESHOLD = 10 // Stop if object is within 10cm
let last_distance_check = 0

const Tx_pin: SerialPin = SerialPin.P12
const Rx_pin: SerialPin = SerialPin.P8
let LED_pin = DigitalPin.P2
let SSID_1 = "-----"
let PASSWORD_1 = "-----"
let SSID_2 = "Bot-Controller"
let PASSWORD_2 = "IamSpeed"

music.play(music.stringPlayable("C5 G - A B G - E ", 120), music.PlaybackMode.UntilDone)
pins.digitalWritePin(LED_pin, 0)
serial.redirect(Tx_pin, Rx_pin, 115200)
sendAT("AT+RESTORE", 1000)
sendAT("AT+RST", 1000)
sendAT("AT+CWMODE=" + WIFI_MODE)

if (WIFI_MODE == 1) {
    sendAT("AT+CWJAP=\"" + SSID_1 + "\",\"" + PASSWORD_1 + "\"")
    if (!(waitForResponse("OK"))) {
        control.reset()
    }
} else if (WIFI_MODE == 2) {
    sendAT("AT+CWSAP=\"" + SSID_2 + "\",\"" + PASSWORD_2 + "\",1,4", 1000)
}

sendAT("AT+CIPMUX=1")
sendAT("AT+CIPSERVER=1,80")
sendAT("AT+CIFSR")
basic.showIcon(IconNames.Yes)

while (true) {
    // Check for obstacles every 100ms to avoid interfering with wifi operations
    if (input.runningTime() - last_distance_check > 100) {
        checkObstacle()
        last_distance_check = input.runningTime()
    }
    
    incoming = serial.readString()
    serial_str = "" + serial_str + incoming
    if (serial_str.length > 200) {
        serial_str = serial_str.substr(serial_str.length - 200)
    }
    if (serial_str.includes("+IPD") && serial_str.includes("HTTP")) {
        client_ID = serial_str.substr(serial_str.indexOf("IPD") + 4, 1)
        GET_pos = serial_str.indexOf("GET")
        HTTP_pos = serial_str.indexOf("HTTP")
        GET_command = serial_str.substr(GET_pos + 5, HTTP_pos - 1 - (GET_pos + 5))
        switch (GET_command) {
            case "":
                GET_success = true
                break
            case "Sad":
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                if (!obstacle_detected) basic.showIcon(IconNames.Sad)
                break
            case "Happy":
                GET_success = true
                LED_status = 1 - LED_status
                pins.digitalWritePin(LED_pin, LED_status)
                if (!obstacle_detected) basic.showIcon(IconNames.Happy)
                break
            case "forward":
                GET_success = true
                // Only move if no obstacle detected
                if (!obstacle_detected) {
                    maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 45)
                }
                break
            case "backward":
                GET_success = true
                // Backward movement allowed even with obstacle (to escape)
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Backward, 45)
                break
            case "left":
                GET_success = true
                // Only turn if no obstacle detected
                if (!obstacle_detected) {
                    maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, 45)
                    maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, 45)
                }
                break
            case "right":
                GET_success = true
                // Only turn if no obstacle detected
                if (!obstacle_detected) {
                    maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, 45)
                    maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, 45)
                }
                break
            case "stop":
                GET_success = true
                maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 0)
                break
            case "led_on":
                GET_success = true
                maqueenPlusV2.ledRainbow(DigitalPin.P15, 300, 255)
                rainbow_led_status = true
                break
            case "led_off":
                GET_success = true
                maqueenPlusV2.ledRainbow(DigitalPin.P15, 0, 0)
                rainbow_led_status = false
                break
            case "hoot":
                GET_success = true
                music.playTone(262, music.beat(BeatFraction.Whole))
                break
        }
        HTML_str = getHTML(GET_success)
        sendAT("AT+CIPSEND=" + client_ID + "," + (HTML_str.length + 2))
        sendAT(HTML_str, 500)
        sendAT("AT+CIPCLOSE=" + client_ID)
        serial_str = ""
    }
}

function sendAT(command: string, waitTime: number = 100) {
    serial.writeString(command + "\u000D\u000A")
    basic.pause(waitTime)
}