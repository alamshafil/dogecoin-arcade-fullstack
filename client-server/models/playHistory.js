// Copyright (c) 2022 Shafil Alam

import mongoose from 'mongoose';

const ArcadePlayHistorySchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  timestamp: {
    type: Number,
    required: true
  },
  arcade_name: {
      type: String,
      required: true,
  },
  arcade_id: {
    type: String,
    required: true,
  },
  arcade_address: {
      type: String,
      required: true
  }
}, {collection : 'arcade-plays'});

const ArcadePlayHistory = mongoose.model("ArcadePlayHistory", ArcadePlayHistorySchema);

export default ArcadePlayHistory;
