 #include <Arduino.h>
#include "Adafruit_NeoTrellisM4.h"
#include <Adafruit_NeoPixel.h>

#define PIN 10  // for Neopixels

// For Serial Read
String a;  // a String to hold incoming data
bool busy = false;
int nextColor = 0;
int currentColorIteration = 0;
int defaultDelay = 50;

// For Neopixels
Adafruit_NeoPixel strip = Adafruit_NeoPixel(32, PIN, NEO_GRB + NEO_KHZ800);

// The NeoTrellisM4 object is a keypad and neopixel strip subclass
// that does things like auto-update the NeoPixels and stuff!
Adafruit_NeoTrellisM4 trellis = Adafruit_NeoTrellisM4();

void setup() {
    Serial.begin(9600);
    trellis.begin();
    Serial.println("basic keypad test!");
}

// Track lit buttons
int litButtons[33] = {0};

void printLitButtonListAndSetBusy() {
            bool foundLitKey = false;
            Serial.print("LitButtons:[");
            bool needComma = false;
            for (int i = 1; i < 33; i++) {
                if (needComma) {
                  Serial.print(",");
                }
                needComma = true;
                if (!foundLitKey) {
                    foundLitKey = litButtons[i] == 1;
                }
                Serial.print(String(litButtons[i]));
                // if (litButtons[i] == 1) {
                //     Serial.print("LitButtons:");
                //     Serial.println(String(i));
                // }
            }
            Serial.println("]");
            busy = foundLitKey;
}

void getKeyPress() {
    while (trellis.available()) {
        keypadEvent e = trellis.read();
        if (e.bit.EVENT == KEY_JUST_PRESSED) {
            Serial.print("Pressed:[");
            Serial.print((int) e.bit.KEY);
            Serial.println("]");
            //trellis.setPixelColor(e.bit.KEY, 0xFFFFFF);
        } else if (e.bit.EVENT == KEY_JUST_RELEASED) {
            Serial.print("Released:[");
            Serial.print((int) e.bit.KEY);
            Serial.println("]");
            //trellis.setPixelColor(e.bit.KEY, 0x0);
            //litButtons[e.bit.KEY] = 0;
            //printLitButtonListAndSetBusy();
        }
    }
}

// Key values and update variables
bool buttonInputActive = false;
int inputButtonPlace = 1;
int inputButtonValue = 0;

// Color values and update variables
bool redInputActive = false;
bool greenInputActive = false;
bool blueInputActive = false;
int inputColorPlace = 1;
int redColorValue = 0;
int greenColorValue = 0;
int blueColorValue = 0;

// TODO: Keep a list of active buttons, so when all are pressed, we can continue, but not before.

void gatherInput(const String &key) {
    for (char c: key) {
        if (c == '<') {
            // Serial.print("<");
            // < is the beginning of a string of input.
            redInputActive = false;  // Just in case we missed something and caught this mid-cycle
            greenInputActive = false;  // Just in case we missed something and caught this mid-cycle
            blueInputActive = false;  // Just in case we missed something and caught this mid-cycle

            // Reset and activate Key value input variables
            inputButtonPlace = 1;
            inputButtonValue = 0;
            buttonInputActive = true;
        } else if (c == ':') {
            buttonInputActive = false;
            // Reset and activate Color value input variables
            inputColorPlace = 1;
            redColorValue = 0;
            redInputActive = true;
            greenInputActive = false;  // Just in case we missed something and caught this mid-cycle
            blueInputActive = false;  // Just in case we missed something and caught this mid-cycle
        } else if (c == ',' && redInputActive) {
            // Reset and activate Color value input variables
            inputColorPlace = 1;
            greenColorValue = 0;
            redInputActive = false;
            greenInputActive = true;
            blueInputActive = false;
        } else if (c == ',' && greenInputActive) {
            // Reset and activate Color value input variables
            inputColorPlace = 1;
            blueColorValue = 0;
            redInputActive = false;
            greenInputActive = false;
            blueInputActive = true;
        } else if (c == '>') {
            // Serial.println(">");
            // > is the EOL string

            // Stop parsing Color value inputs and use data to set newButtonValue
            redInputActive = false;
            blueInputActive = false;
            greenInputActive = false;

            buttonInputActive = false;  // Just in case we missed something and caught this mid-cycle

            // Now set board as "busy"
            busy = true;

            // Flag lit key
            litButtons[inputButtonValue] = 1;

            printLitButtonListAndSetBusy();

            // For debugging
            // Serial.print("<");
            // Serial.print(String(inputButtonValue));
            // Serial.print(":");
            // Serial.print(String(redColorValue));
            // Serial.print(",");
            // Serial.print(String(greenColorValue));
            // Serial.print(",");
            // Serial.print(String(blueColorValue));
            // Serial.print(">");

            // And light up given button to given value
            trellis.setPixelColor(inputButtonValue, Adafruit_NeoPixel::Color(redColorValue, greenColorValue, blueColorValue));

        } else if (isDigit(int(c))) {
            // https://stackoverflow.com/a/628778/4982408
            int x = c - '0';

            if (buttonInputActive) {
                inputButtonValue = inputButtonValue * inputButtonPlace + x;
                inputButtonPlace = 10;
            } else if (redInputActive) {
                redColorValue = redColorValue * inputColorPlace + x;
                inputColorPlace = 10;
            } else if (greenInputActive) {
                greenColorValue = greenColorValue * inputColorPlace + x;
                inputColorPlace = 10;
            } else if (blueInputActive) {
                blueColorValue = blueColorValue * inputColorPlace + x;
                inputColorPlace = 10;
            }
        }
    }
}

void getSerialInput() {
    if (Serial.available()) {
        // milliseconds for Serial.readString Default is 1000, making it very slow, it can probably be close to 0!
        Serial.setTimeout(defaultDelay);
        a = Serial.readString();  // read the incoming data as string
        // Serial.println(a);
        gatherInput(a);
    }
}


// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
    for (uint16_t i = 0; i < strip.numPixels(); i++) {
        strip.setPixelColor(i, c);
        strip.show();
        delay(wait);
    }
}

// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
    WheelPos = 255 - WheelPos;
    if (WheelPos < 85) {
        return Adafruit_NeoPixel::Color(255 - WheelPos * 3, 0, WheelPos * 3);
    }
    if (WheelPos < 170) {
        WheelPos -= 85;
        return Adafruit_NeoPixel::Color(0, WheelPos * 3, 255 - WheelPos * 3);
    }
    WheelPos -= 170;
    return Adafruit_NeoPixel::Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}

void rainbow(uint8_t wait) {
    uint16_t i, j;
    for (j = 0; j < 256; j++) {
        for (i = 0; i < strip.numPixels(); i++) {
            strip.setPixelColor(i, Wheel((i + j) & 255));
        }
        strip.show();
        delay(wait);
    }
}

// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(uint8_t wait) {
    uint16_t i, j;

    for (j = 0; j < 256 * 5; j++) {  // 5 cycles of all colors on wheel
        for (i = 0; i < strip.numPixels(); i++) {
            strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
        }
        strip.show();
        delay(wait);
    }
}

//Theatre-style crawling lights.
void theaterChase(uint32_t c, uint8_t wait) {
    for (int q = 0; q < 3; q++) {
        for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
            strip.setPixelColor(i + q, c);  //turn every third pixel on
        }
        strip.show();

        delay(wait);

        for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
            strip.setPixelColor(i + q, 0);  //turn every third pixel off
        }
    }
}

//Theatre-style crawling lights with rainbow effect
void theaterChaseRainbow(uint8_t wait) {
    for (int j = 0; j < 256; j++) {  // cycle all 256 colors in the wheel
        for (int q = 0; q < 3; q++) {
            for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
                strip.setPixelColor(i + q, Wheel((i + j) % 255));  //turn every third pixel on
            }
            strip.show();

            delay(wait);

            for (uint16_t i = 0; i < strip.numPixels(); i = i + 3) {
                strip.setPixelColor(i + q, 0);  //turn every third pixel off
            }
        }
    }
}

void colorLoop() {
    switch (nextColor) {
        case 1:
            nextColor++;
            //  Serial.println("Color Wipe Red");
            colorWipe(Adafruit_NeoPixel::Color(255, 0, 0), defaultDelay);  // Red
            break;
        case 2:
            nextColor++;
            //  Serial.println("Color Wipe Green");
            colorWipe(Adafruit_NeoPixel::Color(0, 255, 0), defaultDelay);  // Green
            break;
        case 3:
            nextColor++;
            //  Serial.println("Color Wipe Blue");
            colorWipe(Adafruit_NeoPixel::Color(0, 0, 255), defaultDelay);  // Blue
            break;
        case 4:
            currentColorIteration++;
            if (currentColorIteration > 9) {
                currentColorIteration = 0;
                nextColor++;
            }
            // Serial.println("Theater Chase White");
            theaterChase(Adafruit_NeoPixel::Color(127, 127, 127), defaultDelay);  // White
            break;
        case 5:
            currentColorIteration++;
            if (currentColorIteration > 9) {
                currentColorIteration = 0;
                nextColor++;
            }
            // Serial.println("Theater Chase Red");
            theaterChase(Adafruit_NeoPixel::Color(127, 0, 0), defaultDelay);  // Red
            break;
        case 6:
            currentColorIteration++;
            if (currentColorIteration > 9) {
                currentColorIteration = 0;
                nextColor++;
            }
            // Serial.println("Theater Chase Blue");
            theaterChase(Adafruit_NeoPixel::Color(0, 0, 127), defaultDelay);  // Blue
            break;
            //  case 7:
            //    nextColor++;
            //    Serial.println("Rainbow");
            //    rainbow(20);
            //    break;
            //  case 8:
            //    Serial.println("Rainbow Cycle");
            //    rainbowCycle(20);
            //  case 9:
            //    Serial.println("Theater Chase Rainbow");
            //    theaterChaseRainbow(defaultDelay);
        default:
            // nextColor = 1;
            nextColor = 4;
            break;
    }
}

void loop() {
    trellis.tick();

    getKeyPress();

    getSerialInput();

    // if (!busy) {
    //     colorLoop();
    // }
}
