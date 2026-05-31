import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";
import { aiController } from "../controllers/ai.controller";

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP."));
    }
  },
});

router.get("/health", aiController.health);
router.get("/metadata", aiController.metadata);

router.post("/predict/all", aiController.predictAll);
router.post("/predict/fast-moving", aiController.predictFastMoving);
router.post("/predict/low-stock", aiController.predictLowStock);
router.post("/predict/profit", aiController.predictProfit);

router.get("/recommendations/top-products", aiController.topProductsGet);
router.post("/recommendations/top-products", aiController.topProductsPost);
router.get("/recommendations/high-profit", aiController.highProfitGet);
router.post("/recommendations/high-profit", aiController.highProfitPost);
router.get("/recommendations/restock-priority", aiController.restockPriorityGet);
router.post("/recommendations/restock-priority", aiController.restockPriorityPost);

router.get("/insights/summary", aiController.insightsSummaryGet);
router.post("/insights/summary", aiController.insightsSummaryPost);

router.get("/products/search", aiController.searchProducts);
router.get("/forecast/daily-kpi", aiController.forecastDailyKpiGet);
router.post("/forecast/daily-kpi", aiController.forecastDailyKpiPost);

router.post("/ocr/scan-receipt", upload.single("file"), aiController.scanReceipt);

export default router;
