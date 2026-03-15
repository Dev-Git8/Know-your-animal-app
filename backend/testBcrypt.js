const bcrypt = require("bcrypt");
async function test() {
    try {
        const hash = await bcrypt.hash("test123", 10);
        console.log("Hash success:", !!hash);
        const match = await bcrypt.compare("test123", hash);
        console.log("Match success:", match);
    } catch (err) {
        console.error("Bcrypt failure:", err);
    }
}
test();
