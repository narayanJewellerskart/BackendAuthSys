const notFound = (req, res, next) => {
	const error = new Error(`Not Found - ${req.originalUrl}`);
	res.status(400);
	next(error);
};

const errorHandler = (err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	let message = err.message;

	// If Mongoose not found error, set to 404 and change message
	if (err.name === "CastError" && err.kind === "ObjectId") {
		statusCode = 404;
		message = "Resource not found";
	}

	res.json({
		message: message,
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
	});
};

export { errorHandler, notFound };
