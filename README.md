# Dogecoin Arcade Full-stack

NOTE: This is a **work-in-progress** and not ready for PRODUCTION!
Repo subject to **CHANGE**!

## How to run

NOTE: The dev server runs the database in memory, so all data will be **LOST** when server is restarted.

### Setting up config files
#### Setting up client-server and dogecoind

Set up the client-server config by copying `client-server/env.sample` to `client-server/.env` and changing the values based on how `dogecoind` is setup.

Here are the default values:
```
MONOGODB_DATABASE_TYPE=memory
# If using server above, then you need to set the below settings
MONGODB_URI=mongodb://127.0.0.1:6000/
MONGODB_DB=arcade

ZMQ_PORT=9000
WEBSOCKET_PORT=7000
MONGODB_MEM_PORT=6000

RPC_USER='doge'
RPC_PASS='dogecoin'
RPC_HOST='127.0.0.1'
RPC_PORT='8000'
RPC_PROTOCOL='http'

USE_MEMPOOL_TX_ONLY=true
MIN_TX_CONF=1

VERBOSE_TX_LOG=false
```


Change values accordingly in your `dogecoin.conf` and `.env`

The setup below would be run like this (running in regtest):
```bash
$ dogecoind -regtest -server=1 -rpcport=8000 -rpcuser=doge -rpcpassword=dogecoin -zmqpubhashtx=tcp://127.0.0.1:9000
```

#### Setting up frontend server

Set up the frontend-server config by copying `frontend-server/env.sample` to `frontend-server/.env` and changing the values based on how you setup MongoDB in client-server.

Here are the default values:
```
MONGODB_URI=mongodb://127.0.0.1:6000/
MONGODB_DB=arcade
```

### Starting up frontend and backend

```bash
npm run install-deps # install deps (one time only)
npm run dev # start up frontend and backend
```

### Starting up client

There is a python-based client (`clients/python/client.py`) and C++ based client (`clients/cpp/client.cpp`) (WIP).

#### Python

##### Setup

Edit the config vars in the python script (`clients/python/client.py`).

**NOTE: These values will be overridden if found from database.**

Example config vars:

```python
# Config
arcade_cost = 5.0 # Default value
arcade_name = "Arcade Test #1" # Default value
arcade_id = "arcade_test_1" # This must unique
arcade_address = "momQpL2WzeQ97yHT4HaUVX4gByDomRQBnS" # Fallback address
```

Make any changes to python script to support your current setup.

##### Running

```bash
python clients/python/client.py
```

#### C++

NOTE: Linux support only (for now)
##### Setup

Edit the config vars in the C++ code (`clients/cpp/client.cpp`).

**NOTE: These values will be overridden if found from database.**

Example config vars:

```cpp
// Config
double arcade_cost = 5.0; // Default value
std::string arcade_name = "Arcade Test #2"; // Default value
std::string arcade_id = "arcade_test_2"; // This must unique
std::string arcade_address = "momQpL2WzeQ97yHT4HaUVX4gByDomRQBnS"; // Fallback address
```

Make any changes to C++ code to support your current setup.

##### Running

```bash
npm run test-cpp # testing

```

## Using the frontend

The frontend will run as `localhost` by default, look in your terminal (output of `npm run dev`) to find the URL.

In the `Arcade Machines` tab you can add a new arcade machine. If you put the same address as your client's config, it will get its cost and name from it, overriding the default values.

*Created by Shafil Alam*
