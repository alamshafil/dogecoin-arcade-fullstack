// Copyright (c) 2022 Shafil Alam

// Import env file
import 'dotenv/config'

// MongoDB imports
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// Model imports
import ArcadeHistory from './models/paymentHistory.js'
import ArcadePlayHistory from './models/playHistory.js'
import Arcade from './models/arcade.js'

// ZMQ, RPC, WS imports
import zmq from 'zeromq'
import RpcClient from 'bitcoind-rpc'
import { WebSocketServer } from 'ws'

// Logging imports
import 'console-error'
import 'console-info'

// Ports based on env 
const ZMQ_PORT = process.env.ZMQ_PORT ?? 9000
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT ?? 7000
const MONGODB_MEM_PORT = process.env.MONGODB_MEM_PORT ?? 6000

// RPC Config based on env
var rpc_config = {
    protocol: process.env.RPC_PROTOCOL ?? 'http',
    user: process.env.RPC_USER,
    pass: process.env.RPC_PASS,
    host: process.env.RPC_HOST ?? '127.0.0.1',
    port: process.env.RPC_PORT ?? '25555',
};

// Set up RPC
var rpc = new RpcClient(rpc_config);

// Check if RPC is up
rpc.help(err => {
    if (err) console.error("[RPC] Failed to connect to Dogecoin RPC: " + err)
    else console.info(`[RPC] Connected to Dogecoin RPC using ${rpc_config.host}:${rpc_config.port}...`)
})

// Set up ZMQ
var sock = zmq.socket('sub')
sock.connect(`tcp://127.0.0.1:${ZMQ_PORT}`);
sock.subscribe('hashtx')
console.info(`[ZMQ] Connected to ZMQ at port ${ZMQ_PORT}...`)

// Set up WS
const wss = new WebSocketServer({ port: WEBSOCKET_PORT })
console.info(`[WS] Websocket server is running at port ${WEBSOCKET_PORT}...`)

// Set up MongoDB server based on env
var mongodb_uri = '';
if (process.env.MONOGODB_DATABASE_TYPE == 'memory') {
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    console.info("[MongoDB/Server] Starting memory server...")
    const mongod = await MongoMemoryServer.create({
        instance: {
            port: MONGODB_MEM_PORT
        }
    });
    mongodb_uri = mongod.getUri();
    console.info(`[MongoDB/Server] Started memory server using port ${MONGODB_MEM_PORT}`)
} else if (process.env.MONOGODB_DATABASE_TYPE == 'server') {
    console.error('[MongoDB] Server option not supported yet...')
    throw new Error('[MongoDB] Server option not supported yet...')
} else {
    console.error('[MongoDB] Invalid MONOGODB_DATABASE_TYPE found in config. Please check your .env file.')
    throw new Error('[MongoDB] Invalid MONOGODB_DATABASE_TYPE found in config. Please check your .env file.')
}

// MongoDB connect to DB
mongoose.connect(mongodb_uri + 'arcade', { useNewUrlParser: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "[MongoDB/Connection] Connection error: "));

db.once("open", function () {
    console.info(`[MongoDB/Connection] Connected to DB using URI ${mongodb_uri}...`);
});

// ZMQ
sock.on('message', (topic, message) => {
    // TODO: Check if mempool TX or inside of a block TX

    rpc.getTransaction(message.toString('hex'), (err, resp) => {
        if (err) {
            console.error("[RPC] Error parsing TX: " + err)
            return; // Bail out
        }

        var tx = resp.result

        // Check if the TX details includes both sent and receive
        if (tx.details.length <= 1) {
            console.error("[RPC] Found TX but is not usable (tx.details.length <= 1)")
            return; // Bail out
        }

        var hash = tx.txid
        var from = tx.details[0].address
        var to = tx.details[1].address
        var value = tx.details[1].amount
        var timestamp = tx.timereceived
        console.info(`[ZMQ] Parsed TX ID: ${hash}`)

        // TODO: Filter TX for each client
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate()
            console.info("[WS] Sending TX to all websocket clients...")
            var data = { action: "tx", data: { from, to, value, hash, timestamp } }
            ws.send(JSON.stringify(data))
        })
    })
})

// WS
wss.on("connection", (ws, req) => {
    console.info(`[WS] ${req.socket.remoteAddress} has connected...`);
    ws.on("message", data => {
        try {
            var message = JSON.parse(data)
        } catch (e) {
            console.error("[WS] Invalid message was sent! Raw data: " + data)
            return;
        }
        if (message.action != null && message.data != null) {
            var info = message.data
            switch (message.action) {
                case "paid":
                    console.info(`[WS] Got ${message.action} where ${info.from} sent ${info.value} DOGE to machine '${info.arcade_name}'`)
                    const arcadeHistory = new ArcadeHistory({ from: info.from, value: info.value, arcade_name: info.arcade_name, arcade_address: info.arcade_address, tx: info.tx, timestamp: info.timestamp })
                    try {
                        arcadeHistory.save();
                    } catch (error) {
                        console.error("[MongoDB] Error: " + error)
                    }
                    break;
                case "play_game":
                    const playHistory = new ArcadePlayHistory({ from: info.from, value: info.value, timestamp: info.timestamp, arcade_name: info.arcade_name, arcade_address: info.arcade_address })
                    try {
                        playHistory.save();
                    } catch (error) {
                        console.error("[MongoDB] Error: " + error)
                    }
                    break;
                case "leave":
                    // Add status to DB
                    console.info(`[WS] Arcade machine '${info.arcade_name} has left.'`)
                    Arcade.findOneAndUpdate({ address: info.arcade_address }, {
                        status: {
                            online: false,
                            timestamp: info.timestamp
                        }
                    }, {})
                        .then(docs => console.info(`[DB] Saved machine '${info.arcade_name}' status to offline at ${info.timestamp}`))
                        .catch(err => console.error(`[DB] Failed to update status for '${info.arcade_name}.' Error: ${err}`))
                    break;
                case "join":
                    console.info(`[WS] Arcade machine '${info.arcade_name}' has joined.`)
                    Arcade.find({ address: info.arcade_address })
                        .then(machines => {
                            // Send cost data to machine
                            console.info(`[WS] Sending infomation from DB to machine '${info.arcade_name}'`)
                            var json = { action: "cost", data: { arcade_name: info.arcade_name, arcade_address: info.arcade_address, cost: machines[0].cost, name: machines[0].name } }
                            ws.send(JSON.stringify(json))
                        })
                        .catch(err => {
                            console.info(`[WS] Error sending infomation from DB to machine '${info.arcade_name}.' Error: ${err}`)
                            var json = { action: "cost", data: { arcade_name: info.arcade_name, arcade_address: info.arcade_address, cost: "Error", name: "Error" } }
                            ws.send(JSON.stringify(json))
                        });
                    // Add status to DB
                    Arcade.findOneAndUpdate({ address: info.arcade_address }, {
                        status: {
                            online: true,
                            timestamp: info.timestamp
                        }
                    }, {})
                        .then(docs => console.info(`[DB] Saved machine '${info.arcade_name}' status to online at ${info.timestamp}`))
                        .catch(err => console.error(`[DB] Failed to update status for '${info.arcade_name}.' Error: ${err}`))
                    break;
                default:
                    console.error("[WS] Unknown action: " + message.action)
                    break;
            }
        } else console.error("[WS] Invalid JSON was sent! Raw data: " + data)
    });

    ws.on("close", () => {
        console.info(`[WS] Client has has left`);
    });

    ws.onerror = function () {
        console.error("[WS] Some error occurred!")
    }
});
