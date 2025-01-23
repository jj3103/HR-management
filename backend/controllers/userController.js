const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const userController = {

  register: async (req, res) => {
    const { email, password, role, serviceNumber } = req.body;

    let status = (role === "superadmin") ? "active" : "desactive";

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      if (role === "superadmin") {
        const result = await userModel.checkSuperAdmin();
        if (role === "superadmin" && result.length > 0) {
          res.status(200).send(true);
          return;
        }
      }

      // Create user in database
      await userModel.createUser(email, hashedPassword, role, serviceNumber, status);
      res.status(200).send('User registered successfully');

    } catch (error) {
      console.error('Error registering user', error);
      res.status(500).send('Error registering user');
    }
  },

  login: (req, res) => {
    const { email, password } = req.body;

    userModel.getUserByUsername(email, (err, result) => {
      if (err) {
        return res.status(500).send('Error logging in');
      }

      if (result.length === 0) {
        return res.status(401).send('User not found');
      }

      const user = result[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).send('Error comparing passwords');
        }

        if (!isMatch) {
          return res.status(401).send('Invalid password');
        }

         req.session.user = { id: user.id, email: user.email, role: user.role };

        // activation
        userModel.Activation(user.id, (err) => {
          if (err) {
            console.error('Error Found for Activation of users', err);
          }
        });

        res.status(200).json({role: user.role, id: user.id, service_number: user.service_number });
      });
    });
  },

  logout: (req, res) => {
    const id = req.body.id;
    // Destroy the session
     req.session.destroy((err) => {
       if (err) {
         return res.status(500).send('Error logging out');
       }

      // Deactivation
      userModel.Desactivation(id, (err) => {
        if (err) {
          console.error('Error deactivating user:', err);
        }
        
      });
      res.status(200).send('Logged out successfully');
     });
  },

  getAllAdmin: (req, res) => {
    userModel.getAdmin((err, result) => {
      if (err) {
        console.error('Error fetching admin', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(result);
    })
  },
  activeAdmin: (req, res) => {

    userModel.getActiveAdmin((err, result) => {
      if (err) {
        console.error('Error Fetching for activeadmin', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(result);
    })
  }
}

module.exports = userController;
