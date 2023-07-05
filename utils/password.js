import bcrypt from "bcryptjs";

const passwordHashing = async (password) => {
	const salt = await bcrypt.genSalt(10);
	let hashPassword = await bcrypt.hash(password, salt);

	return hashPassword;
};

export default passwordHashing;
