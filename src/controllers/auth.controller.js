const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const auth = require('../config/auth.json')
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  if(user.statusValue === 0){
    res.status(200).json(user)
  }else{
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
  }
});

const logout = catchAsync(async (req, res) => {
  const userLogout = await authService.logout(req.user.sub);
  res.status(httpStatus.OK).send(userLogout);
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const googleLogin = catchAsync(async (req, res) => {
  const CLIENT_ID = auth.google.client_id;
  const REDIRECT_URI = auth.google.redirect_uri;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20profile%20email`;
  res.redirect(url);
});

const googleCallbackLogin = catchAsync(async (req, res) => {
  const { code } = req.query;
  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: auth.google.client_id,
      client_secret: auth.google.secret_id,
      redirect_uri: auth.google.redirect_uri,
      grant_type: 'authorization_code'
    });

    const { access_token } = data;
    // Use the access token to fetch user data from Google APIs
    const userData = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // Handle user data, e.g., save to database or respond to the client
    res.json(userData.data);
  } catch (error) {
    console.error('Error:', error.response.data);
    res.status(500).send('Internal Server Error');
  }
});





module.exports = {
  register,
  login,
  logout,
  googleLogin,
  googleCallbackLogin,
  refreshTokens,
};
