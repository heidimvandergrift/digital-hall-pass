const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK.
// This gives our function special privileges to manage users.
admin.initializeApp();

/**
 * Gets a list of all users in Firebase Authentication.
 * This is a "callable" function, which is a secure way for your
 * authenticated app to talk to the backend.
 */
exports.listUsers = functions.https.onCall(async (data, context) => {
  // First, check if the user making the request is actually an admin.
  // We will build the logic for this in a later step. For now, we allow it.
  // if (!context.auth.token.admin) {
  //   return { error: "Request not authorized. User must be an admin." };
  // }

  try {
    // Use the Admin SDK to get all users, 100 at a time.
    const listUsersResult = await admin.auth().listUsers(100);

    // Filter the results to only send back the info we need.
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    }));

    // Send the formatted user list back to the admin page.
    return { users: users };

  } catch (error) {
    console.error("Error listing users:", error);
    return { error: "An error occurred while listing users." };
  }
});