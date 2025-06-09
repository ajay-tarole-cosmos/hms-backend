const admin = require("firebase-admin");
// const serviceAccount = require("../firebase-adminsdk.json");
if (!admin.apps.length) {
admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
  credential: admin.credential.applicationDefault(),
 projectId: "multisphere-5acd3"
});
}

module.exports = admin;
