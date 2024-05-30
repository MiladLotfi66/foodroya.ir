const request = require("request");

export async function POST(req, res) {
    
    // فقط درخواست‌های POST پذیرفته می‌شود
    if (req.method !== "POST") {
        return ({ message: "Method not allowed" });
    }
    
    console.log("sms");
  const { phone } = req.body;
  const code = Math.floor(Math.random() * 99999);

  console.log("phone-->", phone);
  console.log("req-->", req);
  console.log("code-->", code);

  request.post(
    {
      url: "http://ippanel.com/api/select",
      json: true,
      body: {
        op: "pattern",
        user: process.env.IPPANEL_USER, // استفاده از متغیرهای محیطی
        pass: process.env.IPPANEL_PASS, // استفاده از متغیرهای محیطی
        fromNum: "3000505",
        toNum: phone,
        patternCode: "l4p0h3h0vdznka5",
        inputData: [{ "verification-code": code }],
      },
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log("response--->", body);
        return ({ message: "Code sent successfully" });
      } else {
        console.log("Error: ", error);
        console.log("Response body: ", body);
        return ({ message: "Code not sent" });
      }
    }
  );
}
