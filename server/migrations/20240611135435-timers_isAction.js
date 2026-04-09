module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        isAction: { $exists: false },
      },
      [
        {
          $set: { isAction: false },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
