import express from "express";
import * as salaryServices from "../services/salaryServices";

const router = express.Router();

router.get("/", salaryServices.getAllData);
router.get("/:salary", salaryServices.socialClassReference);

export default router;