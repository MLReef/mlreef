export const filterBots = (users) => {
  const bot = /bot$/;
  return users
    .filter((user) => !bot.test(user.username) && !bot.test(user.user_name));
};

export const filterRoot = (users) => users.filter((user) => user.id !== 1);
