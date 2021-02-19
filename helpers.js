const getUserByEmail = function(email, users) {
  // lookup magic...
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

//create random URL
const generateRandomString = () => {
  let output = "";
  const char = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    let newChar = char[Math.floor((Math.random() * char.length))];
    output += newChar;
  }
  return output;
};


module.exports = { getUserByEmail, generateRandomString };