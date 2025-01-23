const PersonnelDetails = require('../models/PersonnelDetails');

class PersonnelDetailsController {
  static async getPersonnelDetails(req, res) {
    try {
      const personnelId = req.params.id;
      const personnelDetails = await PersonnelDetails.getPersonnelDetails(personnelId);
      res.json(personnelDetails);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching personnel details' });
    }
  }
}

module.exports = PersonnelDetailsController;