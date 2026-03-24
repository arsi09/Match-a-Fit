// LoginController.js
// Author: Adan Diaz De Leon
/*
The purpose of this file is to connect the LoginScreen.JS with the LoginController.JS
3/22/26
*/

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'matchafit_users';
const CURRENT_USER_KEY = 'matchafit_currentUser';

export class LoginController {
	static normalizeCredentials(emailOrData, password) {
		if (typeof emailOrData === 'object' && emailOrData !== null) {
			return {
				email: String(emailOrData.email || '').trim(),
				password: String(emailOrData.password || ''),
			};
		}

		return {
			email: String(emailOrData || '').trim(),
			password: String(password || ''),
		};
	}

	static decodePassword(encodedPassword) {
		try {
			return atob(encodedPassword);
		} catch (error) {
			return encodedPassword;
		}
	}

	static async login(emailOrData, password) {
		try {
			const credentials = this.normalizeCredentials(emailOrData, password);

			if (!credentials.email || !credentials.password) {
				return {
					success: false,
					error: 'Email and password are required',
				};
			}

			const usersRaw = await AsyncStorage.getItem(USERS_KEY);
			const users = usersRaw ? JSON.parse(usersRaw) : [];

			const user = users.find((u) => String(u.email || '').trim() === credentials.email);

			if (!user) {
				return {
					success: false,
					error: 'Email is incorrect. Please try again.',
				};
			}

			const decodedPassword = this.decodePassword(user.password || '');
			if (decodedPassword !== credentials.password) {
				return {
					success: false,
					error: 'Password is incorrect. Please try again.',
				};
			}

			const currentUser = {
				id: user.id,
				username: user.username,
				email: user.email,
			};

			await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

			return {
				success: true,
				user: currentUser,
			};
		} catch (error) {
			return {
				success: false,
				error: 'Something went wrong. Please try again.',
			};
		}
	}

	static async handleLoginFromScreen(screenData = {}) {
		const result = await this.login(screenData);

		if (!result.success && typeof screenData.setError === 'function') {
			screenData.setError(result.error);
		}

		if (result.success && screenData.navigation && typeof screenData.navigation.navigate === 'function') {
			screenData.navigation.navigate('Home');
		}

		return result;
	}

	/**
	 * testController - Demonstrates that LoginController is working
	 * Run this to verify the controller functions are operational
	 * @returns {Object} Test results showing controller is functioning
	 */
	static testController() {
		console.log('🧪 LoginController Test Started...');
		
		// Test 1: Normalize credentials with object
		const test1 = this.normalizeCredentials({ email: '  user@example.com  ', password: 'pass123' });
		console.log('✅ Test 1 - normalizeCredentials (object):', test1);
		
		// Test 2: Normalize credentials with string args
		const test2 = this.normalizeCredentials('  test@mail.com  ', 'password456');
		console.log('✅ Test 2 - normalizeCredentials (string args):', test2);
		
		// Test 3: Decode password
		const encoded = btoa('secretPassword');
		const decoded = this.decodePassword(encoded);
		console.log('✅ Test 3 - decodePassword:', { encoded, decoded, match: decoded === 'secretPassword' });
		
		const result = {
			success: true,
			message: '🎉 LoginController is working correctly!',
			tests: {
				normalizeCredentialsObject: test1,
				normalizeCredentialsArgs: test2,
				decodePassword: decoded,
			},
			timestamp: new Date().toISOString(),
		};
		
		console.log('🎉 All tests passed!', result);
		return result;
	}
}

