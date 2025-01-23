//backend\controllers\AdditionalColumnsController.js
const { result } = require('lodash');
const Additional = require('../models/AdditionalColumns');


const AdditionalController = {

    insertColumns: (req, res) => {
        const { columnName, dataType } = req.body;
        Additional.insertColumns('additionalpersonnel', columnName, dataType, (err, results) => {
            if (err) {
                console.error('Error Fetch for Insert Personnel Columns', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ status: 200, message: 'Column Added SuccessFully' });
        })
    },

    insertwifeColumns: (req, res) => {
        const { columnName, dataType } = req.body;
        Additional.insertColumns('additionalwife', columnName, dataType, (err, results) => {
            if (err) {
                console.error('Error Fetch for Insert Wife Columns', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({ status: 200, message: ' Wife Column Added SuccessFully' });
        })
    },

    insertchildColumns: (req, res) => {
        const { columnName, dataType } = req.body;

        Additional.insertColumns('additionalchild', columnName, dataType, (err, results) => {
            if (err) {
                console.error('Error Fetch for Insert Child Columns', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({ status: 200, message: 'Child Column Added SuccessFully' });
        })
    },

    getColumns: (req, res) => {
        Additional.getColumns('additionalpersonnel', (err, results) => {
            if (err) {
                console.error('Error fetching personnel columns', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json(results);
        })
    },

    getwifeColumns: (req, res) => {
        Additional.getColumns('additionalwife', (err, results) => {
            if (err) {
                console.error('Error fetching wife columns', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json(results);
        })
    },

    getchildColumns: (req, res) => {
        Additional.getColumns('additionalchild', (err, results) => {
            if (err) {
                console.error('Error fetching child columns', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json(results);
        })
    },

    insertPersonnelData: (req, res) => {
        const Data = req.body;
        Additional.insertData('additionalpersonnel', Data, (err, results) => {
            if (err) {
                console.error('Error insert personnel data', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({status:200, message: "added"});
        })
    },
    insertWifeData: (req, res) => {
        const Data = req.body;
        Additional.insertData('additionalwife', Data, (err, results) => {
            if (err) {
                console.error('Error insert wife data', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({status:200, message: "added"});
        })
    },
    insertChildData: (req, res) => {
        const Data = req.body;
        Additional.insertData('additionalchild', Data, (err, results) => {
            if (err) {
                console.error('Error insert child data', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.json({status:200, message: "added"});
        })
    },

    getDetails: (req, res) =>{
        const { service_number } = req.params; 
        Additional.getData(service_number,(err, results) =>{
            if(err)
            {
                console.error('Error fetching Additional Personnel Data', err);
                res.status(500).json({error: 'Internal Server Error'});
                return;
            }
            res.json(results)

        });
    },

    getWifeDetails: (req, res) =>{
        const { wife_id } = req.params; 

        Additional.getwifeData(wife_id,(err, results) =>{
            if(err)
            {
                console.error('Error fetching Additional Wife Data', err);
                res.status(500).json({error: 'Internal Server Error'});
                return;
            }
            res.json(results)

        });
    },

    getChildDetails: (req, res) =>{
        const { child_id } = req.params; 

        Additional.getChildData(child_id, (err, results) =>{
            if(err)
            {
                console.error('Error fetching Additional Child Data', err);
                res.status(500).json({error: 'Internal Server Error'});
                return;
            }
            res.json(results)
        });
    }

}

module.exports = AdditionalController;