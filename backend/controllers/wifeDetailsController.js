const WifeDetails = require('../models/WifeDetails');
const Personnel = require('../models/Personnel'); // Assuming you have a Personnel model

const wifeDetailsController = {
  getAll: (req, res) => {
    WifeDetails.getAll((err, results) => {
      if (err) {
        console.error('Error fetching wife details:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    });
  },

  create: (req, res) => {
    const newWifeDetails = req.body;
    const personnelId = newWifeDetails.personnel_id;

    Personnel.getById(personnelId, (err, personnel) => {
      if (err) {
        console.error('Error finding personnel:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      if (!personnel) {
        return res.status(404).json({ error: 'Personnel not found' });
      }

      WifeDetails.create(newWifeDetails, personnelId, (err, result) => {
        if (err) {
          console.error('Error creating wife details:', err);
          res.status(500).json({ error: 'Failed to create wife details' });
          return;
        }
        res.status(201).send('Wife details added successfully.');
      });
    });
  },

  getColumns: (req, res) => {
    WifeDetails.getColumns((err, results) => {
      if (err) {
        console.error('Error fetching columns:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    });
  },

  addColumn: (req, res) => {
    const { columnName, columnType } = req.body;

    if (!columnName || !columnType) {
      return res.status(400).json({ error: 'Column name and type are required' });
    }

    WifeDetails.addColumn(columnName, columnType, (err, result) => {
      if (err) {
        console.error('Error adding column:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.status(201).send(`Column ${columnName} added successfully.`);
    });
  },
};

module.exports = wifeDetailsController;
