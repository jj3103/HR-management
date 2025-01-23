//Routes

// routes/bankDetailsRoutes.js
const express = require("express");
const router = express.Router();
const BankDetailsController = require("../controllers/bankController");

// Routes
router.post("/bank-details", BankDetailsController.createBankDetail);
router.get("/bank-details", BankDetailsController.getBankDetails);
router.get("/bank-details/:id", BankDetailsController.getBankDetailById);
router.put("/bank-details/:id", BankDetailsController.updateBankDetail);
router.delete("/bank-details/:id", BankDetailsController.deleteBankDetail);

module.exports = router;