const mysql = require('mysql2/promise');

class PersonnelDetails {
  static async getPersonnelDetails(personnelId) {
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee',
      });

      const query = `SELECT * FROM personnel p 
                      LEFT JOIN wifedetails ON p.personnel_id = wifedetails.personnel_id 
                      LEFT JOIN personnelcourses ON p.personnel_id = personnelcourses.personnel_id 
                      WHERE p.personnel_id =?`;

      console.log(`Executing query: ${query}`);
      const [result] = await connection.execute(query, [personnelId]);
      console.log(`Query result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      console.error(`Error executing query: ${err.message}`);
      throw err;
    }
  }
}

module.exports = PersonnelDetails;