const { SESClient } = require("@aws-sdk/client-ses");
const REGION = process.env.AWS_REGION || "ap-south-1";

let sesClient;
try {
	sesClient = new SESClient({
		region: REGION,
		credentials: process.env.AWS_ACCESS_KEY
			? {
					accessKeyId: process.env.AWS_ACCESS_KEY,
					secretAccessKey: process.env.AWS_SECRET_KEY,
			  }
			: undefined,
	});
} catch (e) {
	// Fallback to mock for local dev if SDK throws due to bad config
	sesClient = { send: async () => ({ __mock: true }) };
}

module.exports = { sesClient };
