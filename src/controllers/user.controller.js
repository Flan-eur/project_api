const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { email } = require('../config/config');
const { use } = require('passport');


const getUsers = catchAsync(async (req, res) => {
  const result = await userService.queryUsers(req.user.sub);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.sub);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.sub, req.body);
  res.send(user);
});

const uploadImage = catchAsync(async(req, res) =>{
  if(req.body.image){
    const profileImage = await userService.uploadImage(req.body.image,req.user.sub)
    res.status(200).json(profileImage) 
  }else{
  const profileImage = await userService.uploadImage(req.file.path,req.user.sub)
  res.status(200).json(profileImage) 

  }
})

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadImage
};
