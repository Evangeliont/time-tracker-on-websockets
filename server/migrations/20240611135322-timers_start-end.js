module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        start: { $exists: false },
      },
      [
        {
          $set: { start: new Date() },
        },
      ]
    );

    await db.collection("timers").updateMany(
      {
        end: { $exists: false },
      },
      [
        {
          $set: { end: new Date() },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
