import "reflect-metadata";
import app from "./app";
import { sequelize } from "./database/sequelize";

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // dev only
    console.log("✅ Database connected & synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Database error:", error);
  }
})();
