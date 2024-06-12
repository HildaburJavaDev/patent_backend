const crypto = require('crypto');

function encryptData(data) {
	const algorithm = 'aes-256-cbc';
	const key = crypto.randomBytes(32);
	const iv = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
	let encryptedData = cipher.update(JSON.stringify(data), 'utf8', 'hex');
	encryptedData += cipher.final('hex');

	return {
		encryptedData: encryptedData,
		key: key.toString('hex'),
		iv: iv.toString('hex')
	};
}

function decryptData(encryptedData, key, iv) {
	const algorithm = 'aes-256-cbc';

	const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
	let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
	decryptedData += decipher.final('utf8');

	return JSON.parse(decryptedData);
}

module.exports = {
	encryptData,
	decryptData
};
