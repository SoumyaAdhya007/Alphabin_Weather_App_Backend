const mongoose = require("mongoose");

// Define the user schema
const userSchema = mongoose.Schema({
  email: { type: String, required: true }, // User's email, required field
  password: { type: String, required: true }, // User's password, required field
  preferences: {
    unitPreference: { type: String, default: "M" }, // User's preferred unit, default is "M"
    languagePreference: { type: String, default: "en" }, // User's preferred language, default is "en"
  },
  savedLocations: [
    {
      type: String,
      required: true,
      default: [],
    },
  ], // Array of saved locations, each location is of type String and required
});

// Create the user model
const UserModel = mongoose.model("user", userSchema);

// Export the user model
module.exports = { UserModel };
