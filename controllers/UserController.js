const APIErrors = require("../errors/APIErrors");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sequelize = require('../db')
const { User, UserRole, UserLocation } = require('../models/models')
const { encryptData, decryptData } = require('../utils/encryptionModule');
const { where } = require("sequelize");

const generateJwt = (id, role_name) => {
	return jwt.sign(
		{ id, role_name },
		process.env.SECRET_KEY,
		{ expiresIn: '24h' }
	)
}

class UserController {
	async registration(req, res, next) {
		const { email, phoneNumber, firstname, lastname, patronimyc, password, role_id } = req.body;
		if (!email || !password || !firstname || !lastname || !phoneNumber || !role_id) {
			console.log("prob;ems")
			return next(APIErrors.badRequest('Введены не все данные'));
		}

		try {
			const candidate = await User.findOne({ where: { email } });
			if (candidate) {
				return next(APIErrors.badRequest('Пользователь с таким email уже существует'));
			}

			const hashPassword = await bcrypt.hash(password, 5);

			const user = await User.create({
				firstname,
				lastname,
				email,
				password: hashPassword,
				phoneNumber,
				role_id,
				patronimyc
			});
			console.log("userId:" + user.id)
			const token = generateJwt(user.id, "user")
			return res.json({ token })
		} catch (error) {
			console.error(error);
			return next(APIErrors.internalQuery('Произошла ошибка при регистрации пользователя'));
		}
	}


	async login(req, res, next) {
		const { email, password } = req.body
		console.log(req.body)
		const user = await User.findOne({
			attributes: [
				['id', 'id'],
				['phoneNumber', 'phoneNumber'],
				'email',
				'password',
				[sequelize.literal(`"firstname" || ' ' || "lastname"`), 'person_info']
			],
			include: [
				{ model: UserRole, attributes: ['role_name'], required: true }
			],
			where: {
				email: email
			}
		});
		if (!user) {
			return next(APIErrors.internalQuery('Пользователь не найден'))
		}
		let comparePassword = bcrypt.compareSync(password, user.password)
		if (!comparePassword) {
			return next(APIErrors.internalQuery('Указан неверный пароль'))
		}
		const token = generateJwt(user.id, user.user_role.role_name)
		return res.json({ token })
	}


	async check(req, res) {
		const token = generateJwt(req.user.id, req.user.role_name)
		return res.json(token)
	}

	async setUserData(req, res, next) {
		try {
			console.log(req.body)
			const { mail_index, country_name, locality, street_name, house_number, flat_number } = req.body
			if (!mail_index || !country_name || !locality || !street_name || !house_number)
				return next(APIErrors.badRequest("Введены не все данные"))
			const candidate = await UserLocation.findOne({
				where: {
					user_id: req.user.id
				}
			})
			console.log(JSON.stringify(candidate))
			if (candidate)
				return next(APIErrors.forbiddenRequest("Запись данных не требуется, требуется обновление данных"))
			return res.json(await UserLocation.create({
				mail_index,
				country_name,
				locality,
				street_name,
				house_number,
				flat_number,
				user_id: req.user.id
			}))
		} catch (error) {
			console.error('Произошла ошибка при записи данных:', error.message);
			return next(APIErrors.internalQuery('Произошла ошибка при записи данных'));
		}
	}

	async assignModerator(req, res, next) {
		try {
			const { userId } = req.body;
			if (!userId) {
				return res.status(400).json({ message: 'ID пользователя не указан' });
			}

			const user = await User.findByPk(userId);
			if (!user) {
				return res.status(404).json({ message: 'Пользователь не найден' });
			}

			user.role_id = 2;
			await user.save();

			return res.status(200).json({ message: 'Пользователь успешно назначен модератором' });
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	}

	async getProfile(req, res, next) {
		try {
			const user = await User.findByPk(req.params.userId, {
				attributes: ['id', 'firstname', 'email', 'phoneNumber']
			});
			res.json(user);
		} catch (error) {
			console.log("error", error.message)
			return next(APIErrors.badRequest("Error"))
		}
	}
	async updateUserData(req, res, next) {
		try {
			console.log(req.body);
			const { mail_index, country_name, locality, street_name, house_number, flat_number } = req.body;
			if (!mail_index && !country_name && !locality && !street_name && !house_number && !flat_number) {
				return next(APIErrors.badRequest("Нет данных для обновления"))
			}
			console.log(req.body)
			let userLocation = await UserLocation.findOne({
				where: {
					user_id: req.user.id
				}
			})

			// console.log(userLocation)
			console.log(req.user.id)
			if (!userLocation) {
				userLocation = await UserLocation.create({
					mail_index: mail_index,
					country_name: country_name,
					locality: locality,
					street_name: street_name,
					house_number: house_number,
					flat_number: flat_number,
					user_id: req.user.id
				});

				return res.json(userLocation);
			}

			await userLocation.update(
				{
					mail_index: mail_index || userLocation.mail_index,
					country_name: country_name || userLocation.country_name,
					locality: locality || userLocation.locality,
					street_name: street_name || userLocation.street_name,
					house_number: house_number || userLocation.house_number,
					flat_number: flat_number || userLocation.flat_number
				},
				{
					where: { user_id: req.user.id }
				}
			);

			return res.json({ message: "Данные успешно обновлены" });
		} catch (error) {
			console.error('Произошла ошибка при обновлении данных:', error);
			return next(APIErrors.internalQuery('Произошла ошибка при обновлении данных'));
		}
	}

	async updateUserPassword(req, res, next) {
		try {
			console.log("Так то пароль тут")
			const { password } = req.body
			if (!password)
				return next(APIErrors.badRequest("Введен пустой пароль"))
			const hashPassword = await bcrypt.hash(password, 5)
			await User.update({ password: hashPassword }, {
				where: {
					id: req.user.id
				}
			})
			return res.json("Пароль успешно обновлен")
		} catch (error) {
			return next(APIErrors.badRequest(error.message))
		}
	}
}

module.exports = new UserController()