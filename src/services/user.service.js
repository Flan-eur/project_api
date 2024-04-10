const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { password } = require('../validations/custom.validation');
const { findByIdAndUpdate } = require('../models/token.model');
const pick = require('../utils/pick');


/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const create = await User.create(userBody);
  return {statusValue:1,statusText:"Registerd successfully"}
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (id) => {
  const users = await User.findById(id);
  if(users.role == 'Admin'){
    const details = await User.find({role:'user'},{password:0,_id:0,isLoggedIn:0})
    return details
  }else{
    const details = await User.find({isPrivate:false,role:'user'},{password:0,_id:0,isLoggedIn:0})
    return details
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById({_id:id},{password:0,_id:0});
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const updateFields = pick(updateBody, ['name', 'email', 'password', 'phone','isPrivate','image','bio']);
  const user = await User.findByIdAndUpdate({_id:userId},updateFields);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  };
  return user;
};

const updateLogin = async(userId) =>{
  const update= await User.updateOne({_id:userId},{$set:{isLoggedIn:true}})
}

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const uploadImage = async (image,userId) => {
  console.log(image,userId);
  const upload = await User.updateOne({_id:userId},{$set:{image:image}})
  if(upload.ok === 1){
    return {statusValue:1,statusText:"successfully uploaded"}
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateLogin,
  uploadImage
};
