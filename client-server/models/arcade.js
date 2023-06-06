// Copyright (c) 2022-2023 Shafil Alam

import mongoose from 'mongoose';

const ArcadeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
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
}, { collection: 'arcade-machines' });

const Arcade = mongoose.model("Arcade", ArcadeSchema);

export default Arcade;
