 getColumnChild: (req, res) => {
    Personnel.getColumn('childdetails', (err, result1) => {
      if (err) {
        console.error('Error fetching child columns', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      Additional.getColumns('additionalchild', (err, result2) => {
        if (err) {
          console.error('Error fetching additonalchild columns', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        const data = {
          "Field": "Father_name"
        }
        const filteredColumns = result2.filter(col => col.Field !== 'id' && col.Field !== 'child_id');

        const mergedResults = [

          ...data,
          ...result1,
          ...filteredColumns

        ];

        res.json(mergedResults);

      })
    });
  },