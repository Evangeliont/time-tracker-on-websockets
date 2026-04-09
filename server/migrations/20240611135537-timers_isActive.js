module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        isActive: { $exists: false },
      },
      [
        {
          $set: { isActive: false },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
