// Copyright (c) 2022-2023 Shafil Alam 

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
double arcade_cost = 5.0; // Default value
std::string arcade_name = "Arcade Test #2"; // Default value
std::string arcade_id = "arcade_test_2"; // This must unique
std::string arcade_address = "momQpL2WzeQ97yHT4HaUVX4gByDomRQBnS"; // Fallback address

// Game vars
bool playing = false;
double balance = 0.0;

// Basic print marco
#define print(data) std::cout << data << "\n";

// Print config
void print_config() {
    print("--- Arcade Info ---");
    print("Name: " + arcade_name);
    print("Cost: " + std::to_string(arcade_cost) + " DOGE");
    print("Send " + std::to_string(arcade_cost) + " DOGE to play game!");
}

void show_addr() {
    print("Send to this one time address: " + arcade_address)   
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
                    dataObj["arcade_id"] = arcade_id;
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
                        dataObj["arcade_id"] = arcade_id;
                        dataObj["arcade_address"] = arcade_address;
                        playObj["data"] = dataObj;
                        ws->send((std::string)playObj);
                        play_game();
                        // Ask for new address
                        json::jobject askObj;
                        askObj["action"] = "askaddr";
                        json::jobject askData;
                        askData["arcade_name"] = arcade_name;
                        askData["arcade_id"] = arcade_id;
                        askObj["data"] = dataObj;
                        ws->send((std::string)askObj);
                    }
                }
            } else {
                print("[Arcade] Warning! Paid " + value + " DOGE when game was running!");
            }
        }
        if(data["action"] == "address") {
            json::jobject jsonData = json::jobject::parse((std::string)data["data"]);
            if(jsonData["new_addr"] == "Error") {
                print("--- WARNING: Failed to get a new address, using fallback address. ---")
            } else {
                arcade_address = (std::string)jsonData["new_addr"];
                show_addr();
            }
        }
        if(data["action"] == "database") {
            json::jobject jsonData = json::jobject::parse((std::string)data["data"]);
            if(jsonData["cost"] == "Error") {
                print("--- WARNING: Failed to get data from database, make sure this machine is added. ---");
            } else if(jsonData["id"] == arcade_id) {
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
    data["arcade_id"] = arcade_id;
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
