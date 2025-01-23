  //backend\controllers\personnelController.js

  const Personnel = require('../models/Personnel');
  const Additional = require('../models/AdditionalColumns');
  const { json } = require('body-parser');

  const personnelController = {

    getPersonnel: (req, res) => {
      Personnel.getPersonnel('personnel', (err, result1) => {
        if (err) {
          console.error('Error fetching personnel', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        Additional.getdetails('additionalpersonnel', (err, result2) => {
          if (err) {
            console.error('Error fetching additional details', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const mergedResults = result1.map(personnel => {
            const additionalDetails = result2.find(detail => detail.service_number === personnel.service_number);
            return {
              ...personnel,
              ...additionalDetails
            };

          });

          res.status(200).json(mergedResults);
        });
      });
    },


    // getRank Group BY
    getRank: (req, res) => {
      Personnel.getRank((err, result) => {
        if (err) {
          console.error('Error fetching rank', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.status(200).json(result);
      })
    },


    // get all wife
    getWifeAll: (req, res) => {
      Personnel.getPersonnel('wifedetails', (err, result1) => {
        if (err) {
          console.error('Error fetching wife', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        Additional.getdetails('additionalwife', async (err, result2) => {
          if (err) {
            console.error('Error fetching additional wife details', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
          try {
            const mergedResults = await Promise.all(result1.map(async (wife) => {
              const HusbandName = await getPeronnelName(wife.service_number);
              const additionalchild = result2.find(detail => detail.wife_id === wife.wife_id);

              return {
                ...wife,
                ...additionalchild,
                Husband_Name: HusbandName
              };
            }));

            res.status(200).json(mergedResults);

          } catch (error) {
            console.error('Error processing wife details:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      });
    },



    // get all child

    getChildAll: (req, res) => {
      Personnel.getPersonnel('childdetails', (err, result1) => {
        if (err) {
          console.error('Error fetching child', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        Additional.getdetails('additionalchild', async (err, result2) => {
          if (err) {
            console.error('Error fetching additional child details', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          try {
            const mergedResults = await Promise.all(result1.map(async (child) => {
              const fatherName = await getPeronnelName(child.service_number);
              const additionalchild = result2.find(detail => detail.child_id === child.child_id);

              return {
                ...child,
                ...additionalchild,
                Father_name: fatherName
              };
            }));

            res.status(200).json(mergedResults);

          } catch (error) {
            console.error('Error processing child details:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      });
    },





    // --------------------------------------------  Get Individual ---------------------------------------

    getWife: (req, res) => {
      const { serviceNumber } = req.params;
      Personnel.getWife(serviceNumber, async (err, results) => {
        if (err) {
          console.error('Error fetching wife data', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        try {
          const HusbandName = await getPeronnelName(serviceNumber);
          const mergedResults = results.map(wife =>
          ({
            Husband_Name: HusbandName,
            ...wife
          }));

          res.json(mergedResults);

        } catch (error) {
          console.error('Error fetching personnel name:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
    },

    getChild: (req, res) => {
      const { serviceNumber } = req.params;
      Personnel.getChild(serviceNumber, async (err, results) => {
        if (err) {
          console.error('Error fetching child data', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        try {
          const fatherName = await getPeronnelName(serviceNumber);

          const mergedResults = results.map(child => ({
            Father_name: fatherName,
            ...child
          }));

          res.json(mergedResults);

        } catch (error) {
          console.error('Error fetching personnel name:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
    },


    getDetails: (req, res) => {
      const { serviceNumber } = req.params;
      Personnel.getPersonnelDetails(serviceNumber, (err, results) => {
        if (err) {
          console.error('Error Fetching all details', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json(results);
      });
    },

    // --------------------------------------------  Get Column ---------------------------------------

    getColumn: (req, res) => {
      Personnel.getColumn('personnel', (err, result1) => {
        if (err) {
          console.error('Error Fetching personnel columns', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        Additional.getColumns('additionalpersonnel', (err, result2) => {
          if (err) {
            console.error('Error fetching additional personnel columns', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const filteredColumns = result2.filter(col => col.Field !== 'id' && col.Field !== 'service_number')

          const mergedResults = [
            ...result1, ...filteredColumns
          ];

          res.status(200).json(mergedResults);
        });
      });
    },

    getColumnWife: (req, res) => {
      Personnel.getColumn('wifedetails', (err, result1) => {
        if (err) {
          console.error('Error fetching wife columns', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        Additional.getColumns('additionalwife', (err, result2) => {
          if (err) {
            console.error('Error fetching additionalwife columns', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const filteredResult1 = result1.filter(

            col => col.Field !== "wife_id" && col.Field !== "personnel_id" && col.Field !== "service_number"

          )

          const newColumn = {
            Field: 'Husband_Name',
            Type: 'varchar(255)',
            Null: 'YES',
            Key: '',
            Default: null,
            Extra: ''
          };

          const filteredColumns = result2.filter(col => col.Field !== 'id' && col.Field !== 'wife_id');

          const mergedResults = [
            newColumn,
            ...filteredResult1,
            ...filteredColumns
          ];

          res.json(mergedResults);
        })
      });
    },

    getColumnChild: (req, res) => {
      Personnel.getColumn('childdetails', (err, result1) => {
        if (err) {
          console.error('Error fetching child columns', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        Additional.getColumns('additionalchild', (err, result2) => {
          if (err) {
            console.error('Error fetching additional child columns', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const filteredResult1 = result1.filter(

            col => col.Field !== "child_id" && col.Field !== "personnel_id" && col.Field !== "service_number"

          )

          const newColumn = {
            Field: 'Father_name',
            Type: 'varchar(255)',
            Null: 'YES',
            Key: '',
            Default: null,
            Extra: ''
          };

          const filteredColumns = result2.filter(col => col.Field !== 'id' && col.Field !== 'child_id');

          const mergedResults = [
            newColumn,
            ...filteredResult1,
            ...filteredColumns
          ];

          res.json(mergedResults);
        });
      });
    },



    // --------------------------------------------  Insert Data ---------------------------------------
    insertPersonnel: (req, res) => {
      const personnelData = req.body;
      const photo = req.file;

      if (photo) {
        personnelData.photo = photo.filename; // Save the path of the uploaded photo
      }

      Personnel.insertPersonnel(personnelData, (err, results) => {
        if (err) {
          console.error('Error inserting personnel data', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ status: 200, message: 'Personnel data inserted', insertId: results.insertId });
      });
    },


    insertWife: (req, res) => {
      const wifeData = req.body;
      const jointphoto = req.file;

      if(jointphoto)
      {
        wifeData.jointphoto = jointphoto.filename
      }

      Personnel.insertWife(wifeData, (err, results) => {
        if (err) {
          console.error('Error inserting wife data', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ status: 200, message: 'Wife data inserted', insertId: results.insertId });
      });
    },

    insertChild: (req, res) => {
      const childData = req.body;
      Personnel.insertChild(childData, (err, results) => {
        if (err) {
          console.error('Error inserting child data', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ status: 200, message: 'Child data inserted', insertId: results.insertId });
      });
    },

    getPhoto: (req, res) => {
      const serviceNumber =req.params.serviceNumber
      Personnel.getphoto(serviceNumber, (err, result) => {
        if (err) {
          console.error('  Error for Fetching Photo');
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json(result);
      })
    },

    totalPersonnel: (req, res) =>{
      
      Personnel.getNumber((err, result) =>{
        if(err)
        {
          console.error('Error to Fetch Number');
          res.status(500).json({error : 'Internal Server Error'});
          return;
        }
        res.json(result);
      })
    }
  };

  const getPeronnelName = async (serviceNumber) => {
    return new Promise((resolve, reject) => {
      Personnel.getPersonnelDetails(serviceNumber, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const PersonnelName = data.length > 0 ? `${data[0].first_name} ${data[0].last_name}` : 'Unknown';
          resolve(PersonnelName);
        }
      });
    });
  };



  module.exports = personnelController;