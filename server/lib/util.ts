export function parseObject(str: string): Record<string, string> {
  const lines = str.split("\n");
  const data: Record<string, string> = {};
  
  lines.forEach(element => {
    const [key, value] = element.split(":");
    if (key && value) {
      data[key.trim().toLowerCase().replace(/ /gi, "-")] = value.trim();
    }
  });
  
  return data;
}
