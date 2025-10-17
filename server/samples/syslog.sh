echo "<134>fw01 vendor=demo product=ngfw action=deny src=10.0.1.10 dst=8.8.8.8 spt=5353 dpt=53 severity=8 proto=udp msg='DNS blocked'" | nc -u -w1 127.0.0.1 5514

echo "<190>Aug 20 13:01:02 r1 if=ge-0/0/1 event=link-down mac=aa:bb:cc:dd:ee:ff reason=carrier-loss" | nc -u -w1 127.0.0.1 5514