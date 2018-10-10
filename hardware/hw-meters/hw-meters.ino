int cpuPin = 9;
int gpuPin = 10;
int tempPin = 11;
byte cpuValue = 0;
byte gpuValue = 0;
byte tempValue = 0;
byte cpuTarget = 0;
byte gpuTarget = 0;
byte tempTarget = 0;

void setup() {
  pinMode(cpuPin, OUTPUT);
  pinMode(gpuPin, OUTPUT);
  pinMode(tempPin, OUTPUT);
  Serial.begin(9600);
  startSequence();
  Serial.print("done\r\n");
}

void startSequence() {
  for (int i = 0; i < 512; i++) {
    analogWrite(cpuPin, (256 - abs(i-256)));
    analogWrite(gpuPin, (256 - abs(i-256)));
    analogWrite(tempPin, (256 - abs(i-256)));
    delay(5);
  }
}

void setMeters() {
  while (gpuValue != gpuTarget || cpuValue != cpuTarget || tempValue != tempTarget) {
    if (cpuValue > cpuTarget) {
      cpuValue --;
    }
    if (gpuValue > gpuTarget) {
      gpuValue --;
    }
    if (tempValue > tempTarget) {
      tempValue --;
    }
    
    if (cpuValue < cpuTarget) {
      cpuValue ++;
    }
    if (gpuValue < gpuTarget) {
      gpuValue ++;
    }
    if (tempValue < tempTarget) {
      tempValue ++;
    }
    
    analogWrite(cpuPin, cpuValue);
    analogWrite(gpuPin, gpuValue);
    analogWrite(tempPin, tempValue);
    delay(5);
  }
}

void loop() {
  if (Serial.available() > 0) {
    byte input[3];
    Serial.readBytes(input, 3);
    tempTarget = input[0];
    cpuTarget = input[1];
    gpuTarget = input[2];
    setMeters();
    delay(100);
    Serial.print("done\r\n");
  }
}
