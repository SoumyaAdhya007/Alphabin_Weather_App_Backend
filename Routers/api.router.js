const express = require("express");
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { UserModel } = require("../Model/User.Model");
const { Auth } = require("../Middleware/auth.middleware");

const APIRouter = express.Router();
const API_KEY = process.env.API_KEY;

// Handle the POST request to the '/register' endpoint for User Register
APIRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({ message: "Please provide all details." });
    }

    // Check if the user with the given email already exists
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      return res.status(409).send({ message: "User is already registered." });
    }

    // Hash the password
    bcrypt.hash(password, +process.env.saltRounds, async (err, hash) => {
      if (err) {
        // Handle hashing error
        return res.status(500).send({ message: err.message });
      }
      if (hash) {
        // Create a new user with hashed password
        const newUser = new UserModel({
          email,
          password: hash,
        });

        try {
          // Save the new user to the database
          await newUser.save();
          return res
            .status(201)
            .send({ message: "User registered successfully." });
        } catch (error) {
          // Handle any errors that occurred during the API request
          return res.status(500).send({ message: error.message });
        }
      }
    });
  } catch (error) {
    // Handle general error
    res.status(500).send({ message: error.message });
  }
});

// Handle the POST request to the '/login' endpoint for User Login
APIRouter.post("/login", async (req, res) => {
  // Handle the POST request to the '/login' endpoint
  const { email, password } = req.body; // Extract the email and password from the request body

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({ message: "Please provide all details." });
    }

    // Find the user with the given email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(409).send({ message: "User is not registered." });
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (result) {
        // Passwords match, generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.key);
        return res
          .status(200)
          .send({ message: "User logged in successfully.", token });
      } else {
        // Passwords do not match
        return res.status(401).send({
          message: "Invalid credentials. Please check your email and password.",
        });
      }
    });
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});

// Handle the POST request to the '/userdetails' endpoint for User Details
APIRouter.post("/userdetails", Auth, async (req, res) => {
  // Middleware function 'Auth' is used to authenticate the request
  const userId = req.body.userId;

  try {
    // Check if userId is provided
    if (!userId) {
      return res.status(400).send({ message: "Please provide UserId." });
    }

    // Find the user based on the provided userId
    const user = await UserModel.findOne({ _id: userId });

    // Check if the user is found
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Return the user details
    return res.status(200).send(user);
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});

// Weather endpoint to get weather data based on query parameters
APIRouter.get("/weather", async (req, res) => {
  const city = req.query.city;
  const unit = req.query.units;
  const language = req.query.lang;

  // Construct the base URL for the weather API
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}`;

  // Append unit parameter if provided
  if (unit) {
    url += `&units=${unit}`;
  }

  // Append language parameter if provided
  if (language) {
    url += `&lang=${language}`;
  }

  try {
    // Fetch weather data from the constructed URL
    const response = await fetch(`${url}&key=${API_KEY}`);
    const data = await response.json();

    // Send the weather data as the response
    res.status(200).send(data);
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});

// Handle the POST request to the '/addPreference' endpoint for Updating User Preference
APIRouter.post("/addPreference", Auth, async (req, res) => {
  // Middleware function 'Auth' is used to authenticate the request
  const payload = req.body;
  const userId = req.body.userId;

  try {
    // Check if userId is provided
    if (!userId) {
      return res.status(400).send({ message: "Please provide UserId." });
    }

    // Find the user based on the provided userId
    const foundUser = await UserModel.findOne({ _id: userId });

    // Check if the user is found
    if (!foundUser) {
      return res.status(404).send({ message: "User not found." });
    }

    // Update the user's preferences
    await UserModel.findByIdAndUpdate(
      { _id: userId },
      { preferences: payload }
    );

    return res.status(200).send({ message: "User Preference Updated." });
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});

// Handle the POST request to the '/addLocation' endpoint for adding User Location to savedLocations
APIRouter.post("/addLocation", Auth, async (req, res) => {
  // Middleware function 'Auth' is used to authenticate the request
  const locationToAdd = req.body.location;
  const userId = req.body.userId;

  try {
    // Check if userId is provided
    if (!userId) {
      return res.status(400).send({ message: "Please provide UserId." });
    }

    // Find the user based on the provided userId
    const foundUser = await UserModel.findOne({ _id: userId });

    // Check if the user is found
    if (!foundUser) {
      return res.status(404).send({ message: "User not found." });
    }

    // Check if the location is already in savedLocations
    if (foundUser.savedLocations.some((item) => item === locationToAdd)) {
      return res
        .status(409)
        .send({ message: "Location already in savedLocations." });
    } else {
      // Update the user's locations by pushing the new location
      await UserModel.findByIdAndUpdate(
        { _id: userId },
        {
          $addToSet: {
            savedLocations: locationToAdd,
          },
        }
      );
    }

    return res
      .status(200)
      .send({ message: "User location added to savedLocations." });
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});
// Handle the POST request to the '/removeLocation' endpoint for removing User Location to savedLocations
APIRouter.patch("/removeLocation", Auth, async (req, res) => {
  const locationToRemove = req.body.location;
  const userId = req.body.userId;
  try {
    // Check if userId is provided
    if (!userId) {
      return res.status(400).send({ message: "Please provide UserId." });
    }

    // Find the user based on the provided userId
    const foundUser = await UserModel.findOne({ _id: userId });

    // Check if the user is found
    if (!foundUser) {
      return res.status(404).send({ message: "User not found." });
    }
    // Check if the location exists in savedLocations
    if (!foundUser.savedLocations.includes(locationToRemove)) {
      return res.status(404).send({ message: "Location not found." });
    }

    // Remove the location from savedLocations
    await UserModel.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: {
          savedLocations: locationToRemove,
        },
      }
    );

    return res.status(200).send({ message: "Location removed successfully." });
  } catch (error) {
    // Handle any errors that occurred during the API request
    res.status(500).send({ message: error.message });
  }
});
module.exports = { APIRouter };
