// https://docs.mongodb.com/manual/tutorial/write-scripts-for-the-mongo-shell/#differences-between-interactive-and-scripted-mongo
// https://docs.mongodb.com/manual/reference/method

db.users.insert({
  username: 'admin',
  password: '$2y$07$NRGaBfMC2pS14TcMZQQlBObbpHJgStkdxrpXFuA5yLGnqGlgaHlTi',
  active: true,
  email: 'admin@example.com',
  name: 'Admin',
  role: 'system_admin'
});
