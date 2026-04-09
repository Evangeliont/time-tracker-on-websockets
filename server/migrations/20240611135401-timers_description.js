module.exports = {
  async up(db) {
    await db.collection("timers").updateMany(
      {
        description: { $exists: false },
      },
      [
        {
          $set: { description: "" },
        },
      ]
    );
  },

  async down(db, client) {
    await db.collection("timers").drop();
  },
};
