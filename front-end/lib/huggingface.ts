const HUGGINGFACE_API = "https://api-inference.huggingface.co/models";
const API_TOKEN = process.env.HUGGINGFACE_TOKEN; // Add this to your .env file

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
};

export async function queryModel(model: string, payload: any) {
  const res = await fetch(`${HUGGINGFACE_API}/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return await res.json();
}
