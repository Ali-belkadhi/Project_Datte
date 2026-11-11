const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/degla').then(async () => {
  const c = mongoose.connection.db.collection('product_blockchain_links');
  await c.updateOne(
    { productId: '6af498963ed9ba2c0869b7af' },
    { $set: { createdAt: new Date(), updatedAt: new Date() } }
  );
  console.log('updated');
  process.exit(0);
});
