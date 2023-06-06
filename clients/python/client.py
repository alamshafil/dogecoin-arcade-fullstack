# Copyright (c) 2022-2023 Shafil Alam

import websocket # websocket-client
import rel
import json 
from datetime import datetime

WEBSOCKET_PORT = 7000

# Config
arcade_cost = 5.0 # default value
arcade_name = "Arcade Test #1" # default value
arcade_address = "momQpL2WzeQ97yHT4HaUVX4gByDomRQBnS"

# Game vars
playing = False
balance = 0.0

def main():
    # Start WS server
    start_ws()

def print_config():
    # Print config
    print("--- Arcade Info ---")
    print("Name: " + arcade_name)
    print("Address: " + arcade_address)
    print("Cost: "+ str(arcade_cost) + " DOGE")
    print(f"Send {arcade_cost} DOGE to play game!")

def play_game():
    global balance, playing
    print("[Game] Playing game...")
    playing = True
    playing = False
    print("[Game] Game done.")
    balance = 0.0
    print(f"Send {arcade_cost} DOGE to play game!")

def on_message(ws, message):
    global balance, playing, arcade_cost, arcade_name
    data = json.loads(message)

    if data["action"] != None:
        if data["action"] == "tx":
            info = data["data"]
            addr_from = info['from']
            addr_to = info['to']
            value = info['value']
            hash = info['hash']
            timestamp = datetime.fromtimestamp(info['timestamp'])
            # time = timestamp.strftime("%c")
            # print(f"[Debug Info] {addr_from} sent {value} DOGE to {addr_to} at {time}")

            if not playing:
                if addr_to == arcade_address:
                    balance += float(value)
                    jsonHistory = {
                            "action": "paid", 
                            "data": {
                                "tx": hash,
                                "from": addr_from,
                                "to": addr_to,
                                "value": value,
                                "timestamp": info['timestamp'],
                                "arcade_name": arcade_name,
                                "arcade_address": arcade_address
                            }
                        }
                    ws.send(json.dumps(jsonHistory))
                    print(f"[Arcade] Found payment to this machine! {balance}/{arcade_cost} DOGE was paid.")
                    if balance >= arcade_cost:
                        print(f"[Arcade] Valid amount found!")
                        jsonHistory = {
                            "action": "play_game", 
                            "data": {
                                "from": addr_from,
                                "value": balance,
                                "timestamp": info['timestamp'],
                                "arcade_name": arcade_name,
                                "arcade_address": arcade_address
                            }
                        }
                        ws.send(json.dumps(jsonHistory))
                        play_game()
            else:
                print(f"[Arcade] Warning! Paid {value} DOGE when game was running!")
        elif data["action"] == "cost":
            if data["data"]["cost"] == "Error":
                print("--- WARNING: Failed to get price from database, make sure this machine is added. ---")
            elif data["data"]["arcade_address"] == arcade_address:
                print("--- Got price and name from DB ---")
                arcade_cost = float(data["data"]["cost"])
                arcade_name = data["data"]["name"]
            print_config()
    else:
        print("--- WARNING: Unknown data was sent. ---")

def on_error(ws, error):
    print(str(error))

def on_close(ws, close_status_code, close_msg):
    print("--- Connection closed ---")
    jsonClose = {"action": "leave", "data": {"arcade_name": arcade_name, "arcade_address": arcade_address, "timestamp": int(datetime.now().timestamp())}}
    ws.send(json.dumps(jsonClose))
    exit(0)

def on_open(ws):
    print("--- Opened connection ---")
    jsonOpen = {"action": "join", "data": {"arcade_name": arcade_name, "arcade_address": arcade_address, "timestamp": int(datetime.now().timestamp())}}
    ws.send(json.dumps(jsonOpen))

def handle_close(ws):
    print("--- Connection closed ---")
    jsonClose = {"action": "leave", "data": {"arcade_name": arcade_name, "arcade_address": arcade_address, "timestamp": int(datetime.now().timestamp())}}
    ws.send(json.dumps(jsonClose))
    rel.abort()

def start_ws():
    ws = websocket.WebSocketApp(f"ws://127.0.0.1:{WEBSOCKET_PORT}",
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)

    ws.run_forever(dispatcher=rel)  # Set dispatcher to automatic reconnection
    rel.signal(2, lambda: handle_close(ws))  # Keyboard Interrupt
    rel.dispatch()

if __name__ == "__main__":
    main()
