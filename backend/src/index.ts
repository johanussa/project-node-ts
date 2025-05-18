import express from "express";
import morgan from "morgan";
import cors from "cors";
import salaryRoutes from "./routes/salaries"

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const PORT = 3000;

app.use("/api/salarios", salaryRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
