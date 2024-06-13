

Anfangswert = 2100
Endwert = 2500
FPS = 10
counter = 0


Wertänderung = Endwert - Anfangswert
WertänderungProBild = Wertänderung / FPS
while counter < FPS:
    Zwischenwert = Anfangswert + counter * WertänderungProBild
    print(Zwischenwert)
    counter += 1

