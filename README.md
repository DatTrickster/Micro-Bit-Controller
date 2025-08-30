<img width="400" height="400" alt="Icon" src="https://github.com/user-attachments/assets/727b9de1-f338-4d3e-b456-9d68b218b818" />

# BBC micro:bit WiFi Robot Controller

A comprehensive IoT robot controller built with BBC micro:bit and ESP8266 WiFi module, featuring web-based remote control, obstacle detection, and sensor monitoring.

## Overview

This project transforms a BBC micro:bit into a WiFi-enabled robot controller that can be operated remotely through a web interface. The system combines motor control, obstacle avoidance, environmental sensing, and wireless connectivity to create a versatile robotic platform.

## Hardware Requirements

- **BBC micro:bit** - Main microcontroller
- **ESP8266 (ESP-01)** - WiFi connectivity module
- **Maqueen Plus V2 Robot Platform** - Motor control and chassis
- **Ultrasonic Sensor (HC-SR04)** - Obstacle detection
- **LED Strip** - Visual feedback (WS2812/Neopixel compatible)
- **External LED** - Status indicator
- **Buzzer/Speaker** - Audio feedback

## Pin Configuration

| Component | micro:bit Pin | Purpose |
|-----------|---------------|---------|
| ESP8266 TX | P8 | Serial communication (Rx) |
| ESP8266 RX | P12 | Serial communication (Tx) |
| Status LED | P2 | Digital output |
| LED Strip | P15 | Neopixel/WS2812 control |
| Ultrasonic Trigger | P13 | Distance sensor trigger |
| Ultrasonic Echo | P14 | Distance sensor echo |

## Features

### 🌐 WiFi Connectivity
- **Access Point Mode**: Creates "Bot-Controller" hotspot (default)
- **Station Mode**: Connects to existing WiFi network
- Web server on port 80 for remote control

### 🚗 Motor Control
- Forward/backward movement
- Left/right turning
- Emergency stop functionality
- Speed control (45% default)

### 🛡️ Safety Features
- **Obstacle Detection**: Automatic stop when objects detected within 10cm
- **Visual Indicators**: X icon for obstacles, checkmark when clear
- **Audio Alerts**: Warning beeps on obstacle detection
- **Backward Override**: Allows reverse movement even with obstacles (escape mechanism)

### 📊 Environmental Monitoring
- **Light Level**: Ambient light sensor readings
- **Temperature**: Built-in temperature sensor
- **Distance Measurement**: Real-time ultrasonic distance readings
- **Obstacle Status**: Clear/detected indicator

### 🎮 Web Interface Controls
- **Movement Controls**: Forward, backward, left, right, stop
- **LED Controls**: Rainbow LED strip on/off
- **Emotional Displays**: Happy/sad face icons
- **Horn**: Sound effect trigger
- **Real-time Status**: Live sensor data display

## Network Configuration

### Default Settings (Access Point Mode)
```
SSID: "Bot-Controller"
Password: "IamSpeed"
Mode: AP (Access Point)
IP: 192.168.4.1
Port: 80
```

### Station Mode Configuration
To connect to existing WiFi, modify:
```typescript
let WIFI_MODE = 1  // Change from 2 to 1
let SSID_1 = "YourWiFiName"
let PASSWORD_1 = "YourWiFiPassword"
```

## Web Interface

The built-in web server provides a clean, mobile-friendly interface featuring:

- **Real-time Dashboard**: Live sensor readings and status
- **Control Buttons**: Intuitive movement and function controls  
- **Responsive Design**: Works on phones, tablets, and computers
- **Status Indicators**: Visual feedback for all robot states

### Available Commands

| Button | Action | Safety Check |
|--------|--------|--------------|
| Forward | Move forward at 45% speed | ✅ Blocked if obstacle |
| Backward | Move backward at 45% speed | ❌ Always allowed |
| Left | Turn left | ✅ Blocked if obstacle |
| Right | Turn right | ✅ Blocked if obstacle |
| Stop | Emergency stop | ❌ Always allowed |
| LED On/Off | Toggle rainbow LEDs | ❌ No restriction |
| Happy/Sad | Show emotion + toggle LED | ❌ No restriction |
| Hoot | Play horn sound | ❌ No restriction |

## Safety System

### Obstacle Detection
- **Sensor Range**: 10cm threshold distance
- **Response Time**: 100ms check interval
- **Actions on Detection**:
  - Immediate motor stop
  - Visual warning (X icon)
  - Audio alert (quarter-note beep at 523Hz)
  - Web interface status update

### Movement Restrictions
- Forward movement blocked when obstacles detected
- Turning blocked when obstacles detected  
- Backward movement always allowed (escape route)
- Manual stop always functional

## Code Structure

### Main Functions

#### `waitForResponse(str: string)`
Waits for specific AT command responses from ESP8266 with 30-second timeout.

#### `getHTML(normal: boolean)`
Generates dynamic HTML for the web interface with real-time sensor data.

#### `checkObstacle()`
Monitors ultrasonic sensor and implements safety responses.

#### `sendAT(command: string, waitTime: number)`
Sends AT commands to ESP8266 with configurable delays.

### Main Loop
1. **Obstacle Monitoring**: 100ms interval safety checks
2. **WiFi Processing**: HTTP request parsing and response
3. **Command Execution**: Motor control and sensor updates
4. **Status Updates**: LED indicators and display updates

## Getting Started

### 1. Hardware Setup
1. Connect ESP8266 to micro:bit using specified pins
2. Attach ultrasonic sensor to P13/P14
3. Connect status LED to P2
4. Mount on Maqueen Plus V2 platform

### 2. Software Installation  
1. Load code into micro:bit using MakeCode editor
2. Verify serial communication at 115200 baud
3. Power on and wait for WiFi initialization

### 3. Connection
1. Connect device to "Bot-Controller" WiFi network
2. Use password "IamSpeed"  
3. Navigate to http://192.168.4.1 in web browser
4. Begin controlling your robot!

## Troubleshooting

### WiFi Connection Issues
- Check SSID/password configuration
- Verify ESP8266 power supply
- Ensure proper wiring of TX/RX pins
- Monitor serial output for AT command responses

### Movement Problems
- Verify Maqueen Plus V2 library installation
- Check motor power connections
- Confirm obstacle sensor isn't triggered
- Test manual stop functionality

### Sensor Reading Errors
- Check ultrasonic sensor connections
- Verify 5V power supply for sensors
- Test distance readings in serial monitor
- Calibrate threshold distances

## Advanced Customization

### Speed Adjustment
Modify motor speeds by changing the value in `controlMotor` calls:
```typescript
maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.AllMotor, maqueenPlusV2.MyEnumDir.Forward, 45)
//                                                                                              ^^
//                                                                                        Speed: 0-255
```

### Distance Threshold
Adjust obstacle detection sensitivity:
```typescript
const OBSTACLE_THRESHOLD = 10 // Change value (in centimeters)
```

### Additional Commands
Add new web commands by extending the switch statement:
```typescript
case "your_command":
    GET_success = true
    // Your custom action here
    break
```

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Contributing

Contributions welcome! Please submit pull requests with:
- Clear description of changes
- Testing on actual hardware
- Updated documentation for new features

---

**Happy Robotics! 🤖✨**
