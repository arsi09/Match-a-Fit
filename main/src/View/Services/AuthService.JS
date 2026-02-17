/**
 * View-level AuthService
 * - Views (screens) should call this module instead of talking directly to controllers.
 * - Delegates to the controller (when implemented) or returns a clear fallback response.
 */

const signUp = async (payload) => {
  // Try delegating to the app controller if available. This keeps the view decoupled
  // from controller/backend implementation details.
  try {
    // use require so bundlers won't statically fail if controller isn't present yet
    // eslint-disable-next-line global-require
    const Controller = require('../../../Controllers/AuthController');
    if (Controller && typeof Controller.signUp === 'function') {
      return await Controller.signUp(payload);
    }
  } catch (err) {
    // controller not present — fall through to fallback behaviour
  }

  // FUTURE: replace fallback with a network call using `apiConfig` when backend exists.
  return { success: false, error: 'Auth controller / backend not implemented yet' };
};

export default { signUp };