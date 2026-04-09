module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        duration: { $exists: false },
      },
      [
        {
          $set: { duration: new Date() },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
