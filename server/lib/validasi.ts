import axios from "axios";
import { parseObject } from "./util";

export async function validasi(id: string, server: string): Promise<Record<string, string>> {
  if (!id) throw new Error("Parameter 'id' cannot be empty");
  if (!server) throw new Error("Parameter 'server' cannot be empty");
  
  try {
    const data = await axios.post(
      "https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php",
      new URLSearchParams({
        "attribute_amount": "Weekly Pass",
        "text-5f6f144f8ffee": id,
        "text-1601115253775": server,
        "quantity": "1",
        "add-to-cart": "15145",
        "product_id": "15145",
        "variation_id": "4690783"
      }),
      {
        headers: {
          "Referer": "https://moogold.com/product/mobile-legends/",
          "Origin": "https://moogold.com"
        }
      }
    );

    const { message } = data.data;
    if (!message) throw new Error("Invalid ID Player or Server ID");
    
    return parseObject(message);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
