const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/degla').then(async () => {
  const c = mongoose.connection.db.collection('product_blockchain_links');
  await c.updateOne(
    { productId: '6af498963ed9ba2c0869b7af' },
    { $set: { productId: '6af498963ed9ba2c0869b7af', supplierId: '6af498963ed9ba2c0869b78f', lotId: 'LOT-TEST', chainId: 1337, traceabilityContract: '0xC2D9910D28CEa3481cfF9a802EAC5317538A4423' } },
    { upsert: true }
  );
  console.log('linked');
  process.exit(0);
});
