import { NextRequest, NextResponse } from "next/server";
import multiparty from "multiparty";
import * as XLSX from "xlsx";
// you may use "formidable" i used it before but same result(error i mean ;D)
// the important is to get the entries: entry.client .phone ...
// how to deal with the api is for later

export async function POST(req: NextRequest) {
  try {
    const form = new multiparty.Form();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    const file = files.file[0].path;

    const workbook = XLSX.read(file, { type: "file" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Extract the first entry
    const entry = worksheet[0];
    console.log("*".repeat(40));
    console.log("entry: ", entry);
    console.log("*".repeat(40));

    // Replace the URL with your actual API endpoint
    const apiUrl = "https://app.noest-dz.com/api/public/create/order";

    const payload = {
      api_token: "",
      user_guid: "",
      client: entry.client,
      phone: entry.phone,
      adresse: entry.adresse,
      wilaya_id: 10, // Example wilaya ID i put 10 bcz the api accepts wilaya ids (1,48) , hard coded but will be replaced later
      commune: entry.commune,
      montant: entry.montant, // Example amount
      produit: `${entry.produit}`,
      type_id: entry.type_id === "" ? 1 : 2, // Example type ID
      poids: 1, // Example weight
      stop_desk: entry.stop_desk === "domicile" ? 0 : 1, // Example stop desk option
    };

    try {
      const apiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const apiData = await apiResponse.json();
      console.log("Response from server:", apiData);
    } catch (error) {
      console.error("Error:", error);
    }

    // Respond to the client
    return NextResponse.json({ message: "Data processed successfully" });
  } catch (error) {
    console.error("Error reading or processing the file:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
