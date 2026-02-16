// In the signUp method, add this check:
if (userData.password !== userData.confirmPassword) {
  throw new Error('Passwords do not match');
}