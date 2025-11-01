import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    default: 'BTCUSDT',
    index: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'],
    required: true,
    default: 'MARKET'
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  executedPrice: {
    type: Number
  },
  status: {
    type: String,
    enum: ['PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  strategy: {
    type: String,
    enum: ['MANUAL', 'MOMENTUM', 'MEAN_REVERSION', 'RSI', 'MACD', 'MOVING_AVERAGE'],
    default: 'MANUAL'
  },
  stopLoss: {
    type: Number
  },
  takeProfit: {
    type: Number
  },
  pnl: {
    type: Number,
    default: 0
  },
  pnlPercentage: {
    type: Number,
    default: 0
  },
  fees: {
    type: Number,
    default: 0
  },
  exchangeOrderId: {
    type: String,
    index: true
  },
  exchangeResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, status: 1 });
tradeSchema.index({ createdAt: -1 });

const Trade = mongoose.model('Trade', tradeSchema);

export default Trade;


