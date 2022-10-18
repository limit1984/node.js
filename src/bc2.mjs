import bcrypt from 'bcryptjs';

const h = await bcrypt.hash('123456', 10);
console.log(h);

const hashStr = '$2a$10$ytBQ2HgYIaxeIi7kLaHvb.SRzx6Pq/2G0bUS/qZOZUMlwmYh3n9rG';

console.log(await bcrypt.compare('123456', hashStr));


