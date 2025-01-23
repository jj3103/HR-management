//controller

const BankDetails = require("../models/bankDetails");

const BankDetailsController = {
	createBankDetail: (req, res) => {
		const {
			service_number,
			personnel_id,
			name,
			single_ac_no,
			single_ac_bank_name,
			joint_ac_no,
			joint_ac_bank_name,
		} = req.body;

		BankDetails.insertBankDetail(
			service_number,
			personnel_id,
			name,
			single_ac_no,
			single_ac_bank_name,
			joint_ac_no,
			joint_ac_bank_name,
			(err, results) => {
				if (err) {
					console.error("Error inserting bank detail", err);
					res.status(500).json({ error: "Internal server error" });
					return;
				}
				res.json({ status: 200, message: "Bank detail added successfully" });
			}
		);
	},

	getBankDetails: (req, res) => {
		BankDetails.getAllBankDetails((err, results) => {
			if (err) {
				console.error("Error fetching bank details", err);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
			res.json(results);
		});
	},

	getBankDetailById: (req, res) => {
		const { id } = req.params;
		BankDetails.getBankDetailById(id, (err, result) => {
			if (err) {
				console.error("Error fetching bank detail by ID", err);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
			if (!result) {
				res.status(404).json({ message: "Bank detail not found" });
				return;
			}
			res.json(result);
		});
	},

	updateBankDetail: (req, res) => {
		const { id } = req.params;
		const {
			service_number,
			personnel_id,
			name,
			single_ac_no,
			single_ac_bank_name,
			joint_ac_no,
			joint_ac_bank_name,
		} = req.body;

		BankDetails.updateBankDetail(
			id,
			service_number,
			personnel_id,
			name,
			single_ac_no,
			single_ac_bank_name,
			joint_ac_no,
			joint_ac_bank_name,
			(err, results) => {
				if (err) {
					console.error("Error updating bank detail", err);
					res.status(500).json({ error: "Internal server error" });
					return;
				}
				res.json({ status: 200, message: "Bank detail updated successfully" });
			}
		);
	},

	deleteBankDetail: (req, res) => {
		const { id } = req.params;
		BankDetails.deleteBankDetail(id, (err, results) => {
			if (err) {
				console.error("Error deleting bank detail", err);
				res.status(500).json({ error: "Internal server error" });
				return;
			}
			res.json({ status: 200, message: "Bank detail deleted successfully" });
		});
	},
};

module.exports = BankDetailsController;