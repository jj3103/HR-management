// models/BankDetails.js
const db = require("../db");

const BankDetails = {
    insertBankDetail: (
        service_number,
        personnel_id,
        name,
        single_ac_no,
        single_ac_bank_name,
        joint_ac_no,
        joint_ac_bank_name,
        callback
    ) => {
        const query = `
            INSERT INTO bank_details (service_number, personnel_id, Name,single_ac_no, single_ac_bank_name, joint_ac_no, joint_ac_bank_name )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            query,
            [
                service_number,
                personnel_id,
                name,
                single_ac_no,
                single_ac_bank_name,
                joint_ac_no,
                joint_ac_bank_name
            ],
            callback
        );
    },

    getAllBankDetails: (callback) => {
        const query = "SELECT * FROM bank_details";
        db.query(query, callback);
    },

    getBankDetailById: (id, callback) => {
        const query = "SELECT * FROM bank_details WHERE bank_id = ?";
        db.query(query, [id], callback);
    },

    updateBankDetail: (
        id,
        service_number,
        personnel_id,
        name,
        single_ac_no,
        single_ac_bank_name,
        joint_ac_no,
        joint_ac_bank_name,
        callback
    ) => {
        const query = `
            UPDATE bank_details
            SET 
                service_number = ?, 
                personnel_id = ?, 
                name = ?, 
                single_ac_no = ?, 
                single_ac_bank_name = ?, 
                joint_ac_no = ?, 
                joint_ac_bank_name = ?
            WHERE bank_id = ?
        `;
        db.query(
            query,
            [
                service_number,
                personnel_id,
                name,
                single_ac_no,
                single_ac_bank_name,
                joint_ac_no,
                joint_ac_bank_name,
                id,
            ],
            callback
        );
    },
    
    deleteBankDetail: (id, callback) => {
        const query = "DELETE FROM bank_details WHERE bank_id = ?";
        db.query(query, [id], callback);
    },
};

module.exports = BankDetails;