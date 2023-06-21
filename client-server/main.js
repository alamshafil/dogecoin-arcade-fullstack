// Copyright (c) 2022-2023 Shafil Alam

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

// Startup log
console.info(`Running dogecoin-arcade-client-server`)

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
    if (err) console.error("[RPC] Failed to connect to Dogecoin RPC: " + err.message)
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
var mongodb_db = '';
if (process.env.MONOGODB_DATABASE_TYPE == 'memory') {
    mongodb_db = 'arcade' // Default DB
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    console.info("[MongoDB/Server] Starting memory server...")
    const mongod = await MongoMemoryServer.create({
        instance: {
            port: parseInt(MONGODB_MEM_PORT)
        }
    });
    mongodb_uri = mongod.getUri();
    console.info(`[MongoDB/Server] Started memory server using port ${MONGODB_MEM_PORT}`)
} else if (process.env.MONOGODB_DATABASE_TYPE == 'server') {
    mongodb_uri = process.env.MONGODB_URI;
    mongodb_db = process.env.MONGODB_DB;
} else {
    console.error('[MongoDB] Invalid MONOGODB_DATABASE_TYPE found in config. Please check your .env file.')
    throw new Error('[MongoDB] Invalid MONOGODB_DATABASE_TYPE found in config. Please check your .env file.')
}

// MongoDB connect to DB
mongoose.connect(mongodb_uri + mongodb_db, { useNewUrlParser: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "[MongoDB/Connection] Connection error:"));

db.once("open", function () {
    console.info(`[MongoDB/Connection] Connected to DB using URI ${mongodb_uri}...`);
});

// Logging config
var verbose_tx_log = true;
if (process.env.VERBOSE_TX_LOG == 'true') verbose_tx_log = true;
else if (process.env.VERBOSE_TX_LOG == 'false') verbose_tx_log = false;
else console.error("[env] Found invalid VERBOSE_TX_LOG setting. Defaulting to 'true' option.")

// TX config
var use_mempool_tx_only = true;
if (process.env.USE_MEMPOOL_TX_ONLY == 'true') use_mempool_tx_only = true;
else if (process.env.USE_MEMPOOL_TX_ONLY == 'false') use_mempool_tx_only = false;
else console.error("[env] Found invalid USE_MEMPOOL_TX_ONLY setting. Defaulting to 'true' option.")

console.info(`[env] use_mempool_tx_only = ${use_mempool_tx_only}`)

// ZMQ
sock.on('message', (topic, message) => {
    rpc.getTransaction(message.toString('hex'), (err, resp) => {
        if (err) {
            if (verbose_tx_log) console.error("[RPC] Error parsing TX, likely this TX is not important to us. Error: " + err.message)
            return; // Bail out
        }

        var tx = resp.result

        // Check if TX is miner reward
        if (tx.generated != null && tx.generated) {
            if (verbose_tx_log) console.error("[RPC] Found miner reward TX, skipping it.")
            return; // Bail out
        }

        // Check if TX details includes both sent and receive
        if (tx.details.length <= 1) {
            if (verbose_tx_log) console.error("[RPC] Found TX but is not usable. Could be node sent coins to external wallet.")
            return; // Bail out
        }

        // Check if TX is orphaned
        if (tx.confirmations <= -1) {
            if (verbose_tx_log) console.error("[RPC] Found orphaned TX, skipping it.")
            return; // Bail out
        }

        // Check if mempool TX
        if (tx.confirmations == 0 && !use_mempool_tx_only) {
            if (verbose_tx_log) console.info(`[RPC] Skpping TX ${tx.txid} because it is a mempool TX.`)
            return; // Bail out
        }

        // Check if NOT mempool TX
        if (tx.confirmations >= 1 && use_mempool_tx_only) {
            if (verbose_tx_log) console.info(`[RPC] Skpping TX ${tx.txid} because it is NOT a mempool TX.`)
            return; // Bail out
        }

        var hash = tx.txid
        var from = tx.details[0].address
        var to = tx.details[1].address
        var value = tx.details[1].amount
        var timestamp = tx.timereceived
        console.info(`[ZMQ] Parsed TX ID: ${hash}`)

        // TODO: Filter TX for each client
        console.info("[WS] Sending TX to all websocket clients...")
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate()
            var data = { action: "tx", data: { from, to, value, hash, timestamp } }
            ws.send(JSON.stringify(data))
        })
    })
})

// Function to get new address
function getNewAddress() {
    return new Promise((resolve, reject) => {
        rpc.getNewAddress("", (err, resp) => {
            if (err) {
                console.error("[RPC] Error getting new address: " + err)
                resolve("Error")
            }

            resolve(resp.result)
        })
    });
}

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
                    console.info(`[WS] Got ${message.action} where ${info.from} sent ${info.value} DOGE to machine '${info.arcade_name}' (id: ${info.arcade_id})`)
                    const arcadeHistory = new ArcadeHistory({ from: info.from, value: info.value, arcade_name: info.arcade_name, arcade_id: info.arcade_id, arcade_address: info.arcade_address, tx: info.tx, timestamp: info.timestamp })
                    try { arcadeHistory.save() }
                    catch (error) { console.error(`[DB] Error saving payment data for machine with ID ${info.arcade_id}: ${error}`) }
                    break;
                case "play_game":
                    const playHistory = new ArcadePlayHistory({ from: info.from, value: info.value, timestamp: info.timestamp, arcade_name: info.arcade_name, arcade_id: info.arcade_id, arcade_address: info.arcade_address })
                    try { playHistory.save() }
                    catch (error) { console.error(`[DB] Error saving play data for machine with ID ${info.arcade_id}: ${error}`) }
                    break;
                case "leave":
                    // Add status to DB
                    console.info(`[WS] Arcade machine '${info.arcade_name}' (id: ${info.arcade_id}) has left.`)
                    Arcade.findOneAndUpdate({ id: info.arcade_id }, {
                        status: {
                            online: false,
                            timestamp: info.timestamp
                        }
                    }, {})
                        .then(docs => console.info(`[DB] Saved machine '${info.arcade_name}' (id: ${info.arcade_id}) status to offline at ${info.timestamp}`))
                        .catch(err => console.error(`[DB] Failed to update status for '${info.arcade_name}' (id: ${info.arcade_id}). Error: ${err}`))
                    break;
                case "join":
                    console.info(`[WS] Arcade machine '${info.arcade_name}' (id: ${info.arcade_id}) has joined.`)
                    getNewAddress().then(addr => {
                        // Send new address to machine
                        console.info(`[WS] Sending new address to '${info.arcade_name}' (id: ${info.arcade_id})`)
                        var json = { action: "address", data: { new_addr: addr } }
                        ws.send(JSON.stringify(json))
                    })
                    Arcade.find({ id: info.arcade_id })
                        .then(machines => {
                            // Send data from DB to machine
                            console.info(`[WS] Sending info from DB to machine '${info.arcade_name}' (id: ${info.arcade_id})`)
                            var json = { action: "database", data: { name: machines[0].name, id: info.arcade_id, cost: machines[0].cost } }
                            ws.send(JSON.stringify(json))
                        })
                        .catch(err => {
                            console.info(`[WS] Error sending info from DB to machine '${info.arcade_name}' (id: ${info.arcade_id}). Error: ${err}`)
                            var json = { action: "database", data: { name: 'Error', id: info.arcade_id, cost: "Error" } }
                            ws.send(JSON.stringify(json))
                        });
                    // Add status to DB
                    Arcade.findOneAndUpdate({ id: info.arcade_id }, {
                        status: {
                            online: true,
                            timestamp: info.timestamp
                        }
                    }, {})
                        .then(docs => console.info(`[DB] Saved machine '${info.arcade_name}' (id: ${info.arcade_id}) status to online at ${info.timestamp}`))
                        .catch(err => console.error(`[DB] Failed to update status for '${info.arcade_name}' (id: ${info.arcade_id}). Error: ${err}`))
                    break;
                case "askaddr":
                    console.info(`[WS] '${info.arcade_name}' (id: ${info.arcade_id}) asked for a new address.`)
                    getNewAddress().then(addr => {
                        // Send new address to machine
                        console.info(`[WS] Sending new address to '${info.arcade_name}' (id: ${info.arcade_id})`)
                        var json = { action: "address", data: { new_addr: addr } }
                        ws.send(JSON.stringify(json))
                    })
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
