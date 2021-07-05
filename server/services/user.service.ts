import User, { getExposeUser, IExposedUser, IUser } from '../oauth/user.model';

export async function getAll(): Promise<IExposedUser[]> {
  const users: IUser[] = await User.find({}).limit(1000);
  return users.map((user: IUser) => getExposeUser(user));
}

const UserService = {
  getAll,
};

export default UserService;
