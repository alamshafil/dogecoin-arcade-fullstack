// Copyright (c) 2022-2023 Shafil Alam

import mongoose from 'mongoose';

const ArcadeHistorySchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
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
  },
  tx: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  }
}, { collection: 'arcade-history' });

const ArcadeHistory = mongoose.model("ArcadeHistory", ArcadeHistorySchema);

export default ArcadeHistory;
