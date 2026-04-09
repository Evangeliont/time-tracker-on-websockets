module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        progress: { $exists: false },
      },
      [
        {
          $set: { progress: 0 },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
