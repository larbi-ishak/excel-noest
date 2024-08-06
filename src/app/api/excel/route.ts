// TODO: limit end to empty columns bcz its returning error for those
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { unlink, writeFileSync, readFileSync } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const start = formData.get("start") - 2; // why 2? 0base indexing, the first row containg the titles: phone, client, adresse ...
  const end = formData.get("end") - 2;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  console.log("Start is", start);
  console.log("End is", end);

  const filepath =
    "./tmp/file" + Math.floor(Math.random() * 10000000000000) + ".xlsx";
  try {
    console.log("please wait ....");
    // Writing: Saving file to tmp directory
    writeFileSync(filepath, buffer);

    const f = readFileSync(filepath);
    const workbook = XLSX.read(f, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const sheetData = XLSX.utils.sheet_to_json(worksheet);

    const apiUrl = "https://app.noest-dz.com/api/public/create/order";

    let limit = sheetData.length;
    if (end != -2) limit = end;

    for (let i = start; i <= limit; i++) {
      let entry = sheetData[i];

      const payload = {
        api_token: "DIEqPfBW9qUmOzjDxVBQnj70IHKaSVqrZwO",
        user_guid: "RZR6PM3K",
        client: entry.client,
        phone: `0${entry.phone}`,
        adresse: entry.adresse || entry.commune,
        wilaya_id: entry.wilaya_id, // Example wilaya ID i put 10 bcz the api accepts wilaya ids (1,48) , hard coded but will be replaced later
        commune: entry.commune,
        montant: entry.montant, // Example amount
        produit: `${entry.produit}`,
        type_id: entry.type_id == "echange" ? 2 : 1, // Example type ID
        poids: 1, // Example weight
        stop_desk: entry.stop_desk ? 0 : 1, // Example stop desk option
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

        if (!apiData.success) {
          deleteFile(filepath);
          return NextResponse.json({ success: false });
        }
      } catch (error) {
        console.error("Error:", error);
        deleteFile(filepath);
        return NextResponse.json({ success: false });
      }
    }
  } catch (err) {
    console.log(err);
    deleteFile(filepath);
    return NextResponse.json({ success: false });
  }
  deleteFile(filepath);
  return NextResponse.json({ success: true });
}

const deleteFile = (filePath: string) => {
  unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
};
