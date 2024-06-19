
#Variablen (hier ohne let erstellt, weil dieses Programm in Python geschrieben ist)
Anfangswert = 2100
Endwert = 2500
FPS = 10
counter = 0


Wertänderung = Endwert - Anfangswert
WertänderungProBild = Wertänderung / FPS
#wiederhole FPS-mal
while counter < FPS:
    Zwischenwert = Anfangswert + counter * WertänderungProBild
    print(Zwischenwert)
    counter += 1

