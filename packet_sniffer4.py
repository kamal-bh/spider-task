import pyshark
import datetime
import os
import time

interface = 'wlp1s0'
log_file = '/home/kamal/Desktop/traffic_log.txt'
pcap_file = '/home/kamal/Desktop/traffic_capture.pcap'
os.makedirs(os.path.dirname(pcap_file), exist_ok=True)
capture = pyshark.LiveCapture(interface=interface, output_file=pcap_file)

def process_packet(pkt):
    try:

        timestamp = datetime.datetime.now().isoformat()
        src_ip = pkt.ip.src
        dst_ip = pkt.ip.dst
        src_port = pkt[pkt.transport_layer].srcport
        dst_port = pkt[pkt.transport_layer].dstport
        http_host = pkt.http.host if hasattr(pkt, 'http') else "N/A"

        print("Packet captured!")
        log = f"{timestamp} | {src_ip}:{src_port} → {dst_ip}:{dst_port} | Host: {http_host}"
        print(log)

        with open(log_file, "a") as f:
            f.write(log + "\n")
    except Exception as e:
        print(f"Unexpected error-{e}")

print("Sniffing started (10 seconds)")
start_time = time.time()
try:
    for pkt in capture.sniff_continuously():
        process_packet(pkt)
        if time.time() - start_time > 10:
            break
except KeyboardInterrupt:
    print("Stopped by user")
finally:
    capture.close()
    print(f"Capture done. Saved to: {pcap_file}")
