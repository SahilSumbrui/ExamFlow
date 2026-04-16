const bcrypt = require("bcryptjs");

(async () => {
  const password = "$@#IL2534";
  const hash = await bcrypt.hash(password, 10);
  console.log("HASH:", hash);
})();
