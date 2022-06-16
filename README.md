# Dogecoin Arcade Full-stack

NOTE: This is a **work-in-progress** and not ready for PRODUCTION!
Repo subject to **CHANGE**!

## How to run

NOTE: The dev server runs the database in memory, so all data will be **LOST** when server is restarted.

### Starting up dogecoind

The server by default use these values:

```js
// Ports
const ZMQ_PORT = 9000
const WEBSOCKET_PORT = 7000
const MONGODB_PORT = 6000

// Dogecoin RPC Config
var rpc_config = {
    protocol: 'http',
    user: 'doge',
    pass: 'dogecoin',
    host: '127.0.0.1',
    port: '8000',
};
```

Change values accordingly in your `dogecoin.conf`

The setup below would be run like this (running in regtest):
```bash
$ dogecoind -regtest -server=1 -rpcport=8000 -rpcuser=doge -rpcpassword=dogecoin -zmqpubhashtx=tcp://127.0.0.1:9000
```

### Starting up frontend and backend

```bash
npm run install-deps # install deps (one time only)
npm run dev # start up frontend and backend
```

### Starting up client

There is a python-based client (`client.py`) and C++ based client (`client.cpp`) (WIP).

#### Python

Edit the config vars in the python script (`client.py`).

**NOTE: These values will be overridden if found from database.**

Example config vars:

```python
# Config
arcade_cost = 5.0 # default value
arcade_name = "Arcade Test #1" # default value
arcade_address = "mszsUNneHjsR4s7jqHkrVZBS8DY2PL1tPpz" # must be static
```

Make any changes to python script to support your current setup.

#### C++

TODO

## Using the frontend

The frontend will run as `localhost` by default, look in your terminal (output of `npm run dev`) to find the URL.

In the `Arcade Machines` tab you can add a new arcade machine. If you put the same address as your client's config, it will get its cost and name from it, overriding the default values.

*Created by Shafil Alam*
