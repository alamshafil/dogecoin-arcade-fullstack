// Copyright (c) 2022 Shafil Alam

import mongoose from 'mongoose';

const ArcadeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    default: 0,
  },
  cost: {
      type: String,
      required: true,
  },
  status: {
    online: {
      type: Boolean
    },
    timestamp: {
      type: Number
    }
  }
}, {collection : 'arcade-machines'});

const Arcade = mongoose.model("Arcade", ArcadeSchema);

export default Arcade;
