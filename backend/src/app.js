import express from "express";
import cors from "cors";
import whatsappRoutes from "./routes/whatsapp.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/whatsapp", whatsappRoutes);

export default app;
