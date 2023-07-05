import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

export default corsOptions;
