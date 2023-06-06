// Copyright (c) 2022 Shafil Alam 

#include "wsclient.hpp"
#include "wsclient.cpp"
#include "json.h"
#include "json.cpp"
#include <stdio.h>
#include <iostream>
#include <string>
#include <ctime>

using easywsclient::WebSocket;
static WebSocket::pointer ws = NULL;

// WS Port
const std::string WEBSOCKET_PORT = "7000";

// Config
double arcade_cost = 5.0; // default value
std::string arcade_name = "Arcade Test #2"; // default value
std::string arcade_address = "mszsUNneHjsR4s7jqHkrVZBS8DY2PL1tPp";

// Game vars
bool playing = false;
double balance = 0.0;

// Basic print function
void print(std::string data) {
    std::cout << data << "\n";
}

// Print config
void print_config() {
    print("--- Arcade Info ---");
    print("Name: " + arcade_name);
    print("Address: " + arcade_address);
    print("Cost: " + std::to_string(arcade_cost) + " DOGE");
    print("Send " + std::to_string(arcade_cost) + " DOGE to play game!");
}

// Play game
void play_game() {
    print("[Game] Playing game...");
    playing = true;
    playing = false;
    print("[Game] Game done.");
    balance = 0.0;
    print("Send " + std::to_string(arcade_cost) + " DOGE to play game!");
}

// Handle WS message
void handle_message(const std::string& message)
{
    json::jobject data = json::jobject::parse(message);
    if(data.has_key("action")) {
        if(data["action"] == "tx") {
            json::jobject jsonData = json::jobject::parse((std::string)data["data"]);
            std::string from = jsonData["from"];
            std::string to = jsonData["to"];
            std::string value = jsonData["value"];
            std::string hash = jsonData["hash"];
            std::string timestamp = jsonData["timestamp"];

            if(!playing) {
                if(to == arcade_address) {
                    balance += stod(value);
                    print("[Arcade] Found payment to this machine! " + std::to_string(balance) + "/" + std::to_string(arcade_cost) + " DOGE was paid.");
                    json::jobject historyObj;
                    historyObj["action"] = "paid";
                    json::jobject dataObj;
                    dataObj["tx"] = hash;
                    dataObj["from"] = from;
                    dataObj["to"] = to;
                    dataObj["value"] = value;
                    dataObj["timestamp"] = timestamp;
                    dataObj["arcade_name"] = arcade_name;
                    dataObj["arcade_address"] = arcade_address;
                    historyObj["data"] = dataObj;
                    ws->send((std::string)historyObj);
                    if(balance >= arcade_cost) {
                        print("[Arcade] Valid amount found!");
                        json::jobject playObj;
                        playObj["action"] = "play_game";
                        json::jobject dataObj;
                        dataObj["from"] = from;
                        dataObj["value"] = balance;
                        dataObj["timestamp"] = timestamp;
                        dataObj["arcade_name"] = arcade_name;
                        dataObj["arcade_address"] = arcade_address;
                        playObj["data"] = dataObj;
                        ws->send((std::string)playObj);
                        play_game();
                    }
                }
            } else {
                print("[Arcade] Warning! Paid " + value + " DOGE when game was running!");
            }
        } else if(data["action"] == "cost") {
            json::jobject jsonData = json::jobject::parse((std::string)data["data"]);
            if(jsonData["cost"] == "Error") {
                print("--- WARNING: Failed to get price from database, make sure this machine is added. ---");
            } else if(jsonData["arcade_address"] == arcade_address) {
                print("--- Got price and name from DB ---");
                arcade_cost = stod((std::string)jsonData["cost"]);
                arcade_name = (std::string)jsonData["name"];
            }
            print_config();
        }
    } else {
        print("--- WARNING: Unknown data was sent. ---");
    }
}

int main() {
    ws = WebSocket::from_url("ws://localhost:" + WEBSOCKET_PORT);

    json::jobject obj;
    obj["action"] = "join";
    
    json:json::jobject data;
    data["arcade_name"] = arcade_name;
    data["arcade_address"] = arcade_address;
    data["timestamp"] = std::time(nullptr);
    obj["data"] = data;

    if(ws == NULL) return 0;

    ws->send((std::string)obj);

    while (ws->getReadyState() != WebSocket::CLOSED) {
        ws->poll();
        ws->dispatch(handle_message);
    }

    // TODO: Handle CTRL-C (SIGINT)
    delete ws;

    return 0;
}
