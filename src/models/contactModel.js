const db = require("../config/db");

exports.saveContact = async (data) => {
  const sql = `INSERT INTO contact_us 
  (name, email, contact_no, subject, message)
   VALUES(?,?,?,?,?)`;

  const [result] = await db.query(sql,[
    data.name,
    data.email,
    data.contact_no,
    data.subject,
    data.message
  ]);
  
  return result;
};
