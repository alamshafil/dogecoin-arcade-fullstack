// Copyright (c) 2022 Shafil Alam

import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import ArcadeHistory from './models/paymentHistory.js'
import ArcadePlayHistory from './models/playHistory.js'
import Arcade from './models/arcade.js'
import zmq from 'zeromq' 
import RpcClient from 'bitcoind-rpc'
import { WebSocketServer } from 'ws'

// Ports
const ZMQ_PORT = 9000
const WEBSOCKET_PORT = 7000
const MONGODB_PORT = 6000

// RPC Config
var rpc_config = {
    protocol: 'http',
    user: 'doge',
    pass: 'dogecoin',
    host: '127.0.0.1',
    port: '8000',
};

// Set up MongoDB
// This will create an new instance of "MongoMemoryServer" and automatically start it
console.log("[MongoDB] Starting memory server...")
const mongod = await MongoMemoryServer.create({
    instance: {
      port: MONGODB_PORT
    }
});

const uri = mongod.getUri();
console.log(`[MongoDB] URI: ${uri}`)

// Set up WS
const wss = new WebSocketServer({ port: WEBSOCKET_PORT })
console.log(`[WS] Websocket server is running at port ${WEBSOCKET_PORT}...`)

// Set up RPC
var rpc = new RpcClient(rpc_config); 

// Check if RPC is up
rpc.help(err => { 
    if(err) console.error("[RPC] " + err)
    else console.log("[RPC] Connected to Doge RPC...")
})

// Set up ZMQ
var sock = zmq.socket('sub')
sock.connect(`tcp://127.0.0.1:${ZMQ_PORT}`);
sock.subscribe('hashtx')
console.log("[ZMQ] Connected to ZMQ...")

// MongoDB
// Connect to DB
mongoose.connect(uri+'arcade', {useNewUrlParser: true});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error: "));

db.once("open", function () {
  console.log("[MongoDB] Connected to DB...");
});

// ZMQ
sock.on('message', (topic, message) => {
    rpc.getTransaction(message.toString('hex'), (err, resp) => {
        if(err) console.error("[RPC] " + err)
        var tx = resp.result
        var hash = tx.txid
        var from = tx.details[0].address
        var to = tx.details[1].address
        var value = tx.details[1].amount
        var timestamp = tx.timereceived
        console.log(`[ZMQ] Got TX ID: ${hash}`)

        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate()
            console.log("[WS] Sending TX to all websocket clients...")
            var data = {action: "tx", data: {from, to, value, hash, timestamp}}
            ws.send(JSON.stringify(data))
        })
    })
})

// WS
wss.on("connection", (ws, req) => {
    console.log(`[WS] ${req.socket.remoteAddress} has connected...`);
    ws.on("message", data => {      
        try {
            var message = JSON.parse(data)
        } catch (e) {
            console.log("[WS] Invalid message was sent! Raw data: " + data)
            return;
        }
        if(message.action != null && message.data != null) {
            var info = message.data
            switch (message.action) {
                case "paid":
                    console.log(`[WS] Got ${message.action} where ${info.from} sent ${info.value} DOGE to machine '${info.arcade_name}'`)
                    const arcadeHistory = new ArcadeHistory({from: info.from, value: info.value, arcade_name: info.arcade_name, arcade_address: info.arcade_address, tx: info.tx, timestamp: info.timestamp})
                    try {
                        arcadeHistory.save();
                    } catch (error) {
                        console.log("[MongoDB] Error: " + error)
                    }
                    break;
                case "play_game":
                    const playHistory = new ArcadePlayHistory({from: info.from, value: info.value, timestamp: info.timestamp, arcade_name: info.arcade_name, arcade_address: info.arcade_address})
                    try {
                        playHistory.save();
                    } catch (error) {
                        console.log("[MongoDB] Error: " + error)
                    }
                    break;
                case "leave":
                    // Add status to DB
                    console.log(`[WS] Arcade machine '${info.arcade_name} has left.'`)   
                    Arcade.findOneAndUpdate({address: info.arcade_address}, {
                        status: {
                            online: false,
                            timestamp: info.timestamp
                        }
                    }, {}, function (err, docs) {
                        if(err) console.log(`[DB] Failed to update status for '${info.arcade_name}.' Error: ${err}`)
                        else console.log(`[DB] Saved machine '${info.arcade_name}' status to offline at ${info.timestamp}`)
                    });
                    break;
                case "join":
                    console.log(`[WS] Arcade machine '${info.arcade_name}' has joined.`)
                    Arcade.find({ address: info.arcade_address}, function (err, machines) {
                        // Send cost data to machine
                        console.log(`[WS] Sending infomation from DB to machine '${info.arcade_name}'`)
                        if (err || machines.length == 0) {
                            var json = {action: "cost", data: {arcade_name: info.arcade_name, arcade_address: info.arcade_address, cost: "Error", name: "Error"}}
                            ws.send(JSON.stringify(json))
                        } else {
                            var json = {action: "cost", data: {arcade_name: info.arcade_name, arcade_address: info.arcade_address, cost: machines[0].cost, name: machines[0].name}}
                            ws.send(JSON.stringify(json))
                        }
                    });
                    // Add status to DB
                    Arcade.findOneAndUpdate({address: info.arcade_address}, {
                        status: {
                            online: true,
                            timestamp: info.timestamp
                        }
                    }, {}, function (err, docs) {
                        if(err) console.log(`[DB] Failed to update status for '${info.arcade_name}.' Error: ${err}`)
                        else console.log(`[DB] Saved machine '${info.arcade_name}' status to online at ${info.timestamp}`)
                    });
                    break;
                default:
                    console.log("[WS] Unknown action: " + message.action)
                    break;
            }
        } else console.log("[WS] Invalid JSON was sent! Raw data: " + data)
    });

    ws.on("close", () => {
        console.log(`[WS] Client has has left`);
    });

    ws.onerror = function () {
        console.log("[WS] Some error occurred!")
    }
});
